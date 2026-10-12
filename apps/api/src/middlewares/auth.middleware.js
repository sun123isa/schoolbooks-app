// =============================================================================
// Socle backend — authentification et contrôle des rôles
// L'access token est lu dans le cookie HTTP-only sb_access (jamais dans le
// stockage du navigateur). Le compte est relu en base à chaque requête : un
// compte désactivé perd l'accès immédiatement.
//   router.get('/', authentifier, controller)                  connecté, tout rôle
//   router.post('/', exigerRole('trainer'), controller)       formateur uniquement
//   router.get('/', authentificationFacultative, controller)  req.utilisateur si connecté
// =============================================================================
import { ERROR_CODES } from '@schoolbooks/shared';
import { HttpError } from '../utils/http-error.js';
import { COOKIE_ACCESS, lireCookie } from '../modules/auth/cookies.js';
import { lireAccessToken, obtenirUtilisateur } from '../modules/auth/auth.service.js';

const nonAuthentifie = () =>
  new HttpError(401, ERROR_CODES.NON_AUTHENTIFIE, 'Authentification requise. Veuillez vous connecter.');

async function chargerUtilisateur(req) {
  const charge = lireAccessToken(lireCookie(req, COOKIE_ACCESS));
  if (!charge) return null;
  return obtenirUtilisateur(charge.role, charge.sub);
}

export async function authentifier(req, res, next) {
  const utilisateur = await chargerUtilisateur(req);
  if (!utilisateur) return next(nonAuthentifie());
  req.utilisateur = utilisateur;
  next();
}

// Ne refuse jamais : un jeton absent ou invalide équivaut à un visiteur anonyme.
export async function authentificationFacultative(req, res, next) {
  req.utilisateur = await chargerUtilisateur(req).catch(() => null);
  next();
}

export function exigerRole(...roles) {
  return [
    authentifier,
    (req, res, next) => {
      if (!roles.includes(req.utilisateur.role)) {
        return next(new HttpError(403, ERROR_CODES.ACCES_INTERDIT, "Vous n'avez pas les droits pour cette action."));
      }
      next();
    }
  ];
}
