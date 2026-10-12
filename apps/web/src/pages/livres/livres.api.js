// =============================================================================
// Pages livres — appels API (catalogue, fiche, téléchargement)
// =============================================================================
import { API_ROUTES } from '@schoolbooks/shared';
import { apiGet } from '../../shared/api/client.js';
import { telechargerFichier } from '../../shared/api/telechargement.js';

const mocks = () => import('@schoolbooks/shared/mocks');

export function fetchLivres(criteres, signal) {
  return apiGet(API_ROUTES.livres, {
    params: criteres,
    signal,
    mock: async () => (await mocks()).listerLivresMock(criteres)
  });
}

export function fetchLivre(id, signal) {
  return apiGet(API_ROUTES.livre(id), { signal });
}

export const telechargerLivre = telechargerFichier;
