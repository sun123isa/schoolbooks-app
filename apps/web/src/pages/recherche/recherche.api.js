// =============================================================================
// Page de recherche — appels API
// Responsable : Graciel MBEMBA — relecture : Salem KONGOLO
// Consomme :
//   GET /api/ressources?q=&niveau=&filiere=&matiere=&annee=&type=&page=&limit=&tri=  (Salem)
//   GET /api/niveaux, /api/niveaux/:code/filieres, /api/matieres, /api/annees,
//   /api/types-documents                                                        (Isaac)
// =============================================================================
import { API_ROUTES, ERROR_CODES, RechercheQuerySchema } from '@schoolbooks/shared';
import { ApiError, apiGet } from '../../shared/api/client.js';

const mocks = () => import('@schoolbooks/shared/mocks');

// `criteres` : objet { q, niveau, filiere, matiere, annee, type, page, tri } lu depuis l'URL.
export function rechercherRessources(criteres, signal) {
  return apiGet(API_ROUTES.recherche, {
    params: criteres,
    signal,
    mock: async () => {
      const query = RechercheQuerySchema.safeParse(criteres);
      if (!query.success) throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, 'Critères invalides');
      return (await mocks()).rechercherRessourcesMock(query.data);
    }
  });
}

// Référentiels des filtres, chargés en parallèle.
export async function fetchReferentielsFiltres(signal) {
  const [niveaux, matieres, annees, types] = await Promise.all([
    apiGet(API_ROUTES.niveaux, { signal, mock: async () => (await mocks()).NIVEAUX }),
    apiGet(API_ROUTES.matieres, { signal, mock: async () => (await mocks()).MATIERES }),
    apiGet(API_ROUTES.annees, { signal, mock: async () => (await mocks()).listerAnneesMock() }),
    apiGet(API_ROUTES.typesDocuments, { signal, mock: async () => (await mocks()).TYPES_DOCUMENTS })
  ]);
  return { niveaux, matieres, annees, types };
}

// Séries/filières dépendantes du niveau sélectionné.
export function fetchFilieres(codeNiveau, signal) {
  return apiGet(API_ROUTES.filieresDuNiveau(codeNiveau), {
    signal,
    mock: async () => (await mocks()).listerFilieresMock(codeNiveau) ?? []
  });
}
