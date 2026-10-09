// =============================================================================
// Socle frontend — appels API des comptes (les jetons restent dans les cookies HTTP-only)
// =============================================================================
import { API_ROUTES, ROLES } from '@schoolbooks/shared';
import { ApiError, apiGet, apiPost } from '../api/client.js';

// Mode maquette (sans backend) : référentiels fictifs, aucune session ouverte.
const mocks = () => import('@schoolbooks/shared/mocks');

export async function fetchUtilisateurCourant(signal) {
  const reponse = await apiGet(API_ROUTES.auth.moi, {
    signal,
    mock: async () => {
      throw new ApiError(401, 'NON_AUTHENTIFIE', 'Aucune session en mode maquette.');
    }
  });
  return reponse.utilisateur;
}

export async function connexion(identifiants) {
  return (await apiPost(API_ROUTES.auth.connexion, identifiants)).utilisateur;
}

export async function inscription(role, donnees) {
  const chemin =
    role === ROLES.formateur ? API_ROUTES.auth.inscriptionFormateur : API_ROUTES.auth.inscriptionApprenant;
  return (await apiPost(chemin, donnees)).utilisateur;
}

export function deconnexion() {
  return apiPost(API_ROUTES.auth.deconnexion);
}

// Niveaux scolaires (avec leurs séries/filières) et matières, pour les formulaires.
export function fetchNiveauxScolaires(signal) {
  return apiGet(API_ROUTES.niveauxScolaires, { signal, mock: async () => (await mocks()).NIVEAUX_SCOLAIRES });
}

export function fetchMatieresLivres(signal) {
  return apiGet(API_ROUTES.matieresLivres, { signal, mock: async () => (await mocks()).MATIERES_AVEC_ID });
}
