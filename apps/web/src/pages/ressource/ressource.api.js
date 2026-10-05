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

// Mode mock : PDF servis par Vite depuis apps/web/public/mocks/.
// Les vrais sujets ont leur propre fichier ; les ressources fictives
// utilisent le PDF par défaut.
const PDF_MOCK_PAR_DEFAUT = '/mocks/2020_suj_bac_C.pdf';
export const PDF_MOCK = {
  '0b6f2a4e-1c3d-4e5f-8a9b-000000000012': '/mocks/2016_suj_bac_A.pdf',
  '0b6f2a4e-1c3d-4e5f-8a9b-000000000013': '/mocks/2017_sujC_ph.pdf',
  '0b6f2a4e-1c3d-4e5f-8a9b-000000000014': '/mocks/2020_cor_bac_A.pdf',
  '0b6f2a4e-1c3d-4e5f-8a9b-000000000015': '/mocks/2020_suj_bac_C.pdf'
};

export async function fetchRessource(id, signal) {
  const ressource = await apiGet(API_ROUTES.ressource(id), {
    signal,
    mock: async () => {
      const detail = (await import('@schoolbooks/shared/mocks')).trouverRessourceMock(id);
      if (!detail) throw new ApiError(404, ERROR_CODES.RESSOURCE_INTROUVABLE, 'Ressource introuvable');
      const pdf = PDF_MOCK[id] ?? PDF_MOCK_PAR_DEFAUT;
      return {
        ...detail,
        urls: {
          fichier: detail.urls.fichier && pdf,
          telechargement: detail.urls.telechargement && pdf
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

// -----------------------------------------------------------------------------
// Note : Karene MOUSSOUNDA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
