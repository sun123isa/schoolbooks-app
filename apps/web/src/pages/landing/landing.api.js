// =============================================================================
// Landing page — appels API
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Consomme : GET /api/ressources?tri=recent&limit=…&niveau=…  (recherche, Salem)
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

// Dernières ressources ajoutées (section « Ajoutées récemment »), filtrables par niveau.
export async function fetchNouveautes(nombre, niveau, signal) {
  const resultat = await rechercher({ tri: 'recent', limit: nombre, niveau: niveau || undefined }, signal);
  return resultat.items;
}
