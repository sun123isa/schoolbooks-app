// =============================================================================
// Landing page — appels API
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Consomme (aucune route dédiée n'existe pour les statistiques) :
//   GET /api/niveaux, /api/matieres, /api/types-documents   (référentiels, Isaac)
//   GET /api/ressources?limit=…&tri=recent                  (recherche, Salem)
// =============================================================================
import { API_ROUTES, RechercheQuerySchema } from '@schoolbooks/shared';
import { apiGet } from '../../shared/api/client.js';

const mocks = () => import('@schoolbooks/shared/mocks');

function rechercher(criteres, signal) {
  return apiGet(API_ROUTES.recherche, {
    params: criteres,
    signal,
    mock: async () => (await mocks()).rechercherRessourcesMock(RechercheQuerySchema.parse(criteres))
  });
}

// Chiffres du bandeau : longueur des référentiels + `total` d'une recherche sans critère.
export async function fetchChiffres(signal) {
  const [niveaux, matieres, types, recherche] = await Promise.all([
    apiGet(API_ROUTES.niveaux, { signal, mock: async () => (await mocks()).NIVEAUX }),
    apiGet(API_ROUTES.matieres, { signal, mock: async () => (await mocks()).MATIERES }),
    apiGet(API_ROUTES.typesDocuments, { signal, mock: async () => (await mocks()).TYPES_DOCUMENTS }),
    rechercher({ limit: 1 }, signal)
  ]);
  return {
    niveaux: niveaux.map((niveau) => niveau.libelle).join(' & '),
    ressources: String(recherche.total),
    matieres: String(matieres.length),
    types: String(types.length)
  };
}

// Dernières ressources ajoutées (section « Ajoutées récemment »).
export async function fetchNouveautes(nombre, signal) {
  const resultat = await rechercher({ tri: 'recent', limit: nombre }, signal);
  return resultat.items;
}
