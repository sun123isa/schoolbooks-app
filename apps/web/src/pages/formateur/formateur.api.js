// =============================================================================
// Espace formateur — appels API (rôle formateur exigé par l'API)
// =============================================================================
import { API_ROUTES } from '@schoolbooks/shared';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../shared/api/client.js';

// { items, statistiques: { livres, telechargements, actifs, matieres } }
export function fetchMesLivres(signal) {
  return apiGet(API_ROUTES.mesLivres, { signal });
}

export function fetchTypesDocuments(signal) {
  return apiGet(API_ROUTES.typesDocuments, {
    signal,
    mock: async () => (await import('@schoolbooks/shared/mocks')).TYPES_DOCUMENTS
  });
}

// formulaire : FormData (champs + PDF dans « fichier »).
export function creerLivre(formulaire) {
  return apiPost(API_ROUTES.livres, formulaire);
}

export function modifierLivre(id, formulaire) {
  return apiPatch(API_ROUTES.livreFormateur(id), formulaire);
}

export function desactiverLivre(id) {
  return apiDelete(API_ROUTES.livreFormateur(id));
}

export function restaurerLivre(id) {
  return apiPatch(API_ROUTES.restaurerLivre(id));
}

export function supprimerLivre(id) {
  return apiDelete(API_ROUTES.supprimerLivre(id));
}
