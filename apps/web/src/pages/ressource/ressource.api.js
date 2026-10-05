// =============================================================================
// Page de consultation — appels API
// Responsable : Karene MOUSSOUNDA — relecture : Salem KONGOLO
// Consomme (module ressources, Emmanuel) :
//   GET /api/ressources/:id                  détail (JSON)
//   GET /api/ressources/:id/fichier          PDF en ligne — URL fournie dans data.urls.fichier
//   GET /api/ressources/:id/telechargement   PDF en pièce jointe — data.urls.telechargement
// =============================================================================
import { API_ROUTES, ERROR_CODES } from '@schoolbooks/shared';
import { ApiError, apiGet, resolveApiUrl } from '../../shared/api/client.js';

// PDF d'exemple servi par Vite en mode mock (apps/web/public/mocks/exemple.pdf).
const PDF_MOCK = '/mocks/2020_suj_bac_C.pdf';

export async function fetchRessource(id, signal) {
  const ressource = await apiGet(API_ROUTES.ressource(id), {
    signal,
    mock: async () => {
      const detail = (await import('@schoolbooks/shared/mocks')).trouverRessourceMock(id);
      if (!detail) throw new ApiError(404, ERROR_CODES.RESSOURCE_INTROUVABLE, 'Ressource introuvable');
      return {
        ...detail,
        urls: {
          fichier: detail.urls.fichier && PDF_MOCK,
          telechargement: detail.urls.telechargement && PDF_MOCK
        }
      };
    }
  });

  // URLs directement utilisables par la visionneuse et le bouton « Télécharger ».
  return {
    ...ressource,
    urls: {
      fichier: resolveApiUrl(ressource.urls.fichier),
      telechargement: resolveApiUrl(ressource.urls.telechargement)
    }
  };
}
