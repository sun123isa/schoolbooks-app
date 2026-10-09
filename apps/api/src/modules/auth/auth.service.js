// =============================================================================
// Module AUTH — service (règles métier)
//   - inscription apprenant / formateur : e-mail unique tous rôles confondus,
//     mot de passe haché (scrypt) ; l'inscription ouvre directement une session ;
//   - connexion : message identique pour e-mail inconnu et mauvais mot de passe ;
//   - session : access token court (cookie /api) + refresh token long (cookie
//     /api/auth), ce dernier stocké haché en base et renouvelé à chaque refresh
//     (rotation) : un refresh token ne sert qu'une fois.
// =============================================================================
import { ERROR_CODES } from '@schoolbooks/shared';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/http-error.js';
import * as repository from './auth.repository.js';
import {
  empreinte,
  hacherMotDePasse,
  signerJeton,
  verifierJeton,
  verifierMotDePasse,
  verifierMotDePasseFactice
} from './crypto.js';

// Ligne SQL → UtilisateurSchema (packages/shared/src/contract/auth.schema.js).
export function versUtilisateur(compte) {
  return {
    id: compte.id,
    role: compte.role,
    prenom: compte.first_name,
    nom: compte.last_name,
    email: compte.email,
    niveau: compte.level ?? null,
    specialite: compte.specialty ?? null
  };
}

const sessionExpiree = () =>
  new HttpError(401, ERROR_CODES.SESSION_EXPIREE, 'Votre session a expiré. Veuillez vous reconnecter.');

// Deux inscriptions simultanées : l'index unique (migration 007) tranche.
async function creerSansDoublon(creation) {
  try {
    return await creation();
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, ERROR_CODES.EMAIL_DEJA_UTILISE, 'Un compte existe déjà avec cette adresse e-mail.');
    }
    throw error;
  }
}

async function verifierEmailLibre(email) {
  if (await repository.emailExiste(email)) {
    throw new HttpError(409, ERROR_CODES.EMAIL_DEJA_UTILISE, 'Un compte existe déjà avec cette adresse e-mail.');
  }
}

// Émet un couple access/refresh pour le compte et enregistre la session.
async function ouvrirSession(compte) {
  const accessToken = signerJeton({ sub: compte.id, role: compte.role }, env.jwtAccessSecret, env.accessTokenTtl);
  const refreshToken = signerJeton({ sub: compte.id, role: compte.role }, env.jwtRefreshSecret, env.refreshTokenTtl);
  await repository.creerRefreshToken({
    userId: compte.id,
    role: compte.role,
    tokenHash: empreinte(refreshToken),
    expireLe: new Date(Date.now() + env.refreshTokenTtl * 1000)
  });
  return { utilisateur: versUtilisateur(compte), jetons: { accessToken, refreshToken } };
}

export async function inscrireApprenant(donnees) {
  await verifierEmailLibre(donnees.email);
  if (!(await repository.niveauExiste(donnees.niveau))) {
    throw new HttpError(400, ERROR_CODES.REFERENTIEL_INCONNU, `Niveau scolaire inconnu : ${donnees.niveau}`);
  }
  const motDePasseHache = await hacherMotDePasse(donnees.motDePasse);
  const compte = await creerSansDoublon(() => repository.creerApprenant({ ...donnees, motDePasseHache }));
  return ouvrirSession(compte);
}

export async function inscrireFormateur(donnees) {
  await verifierEmailLibre(donnees.email);
  const motDePasseHache = await hacherMotDePasse(donnees.motDePasse);
  const compte = await creerSansDoublon(() => repository.creerFormateur({ ...donnees, motDePasseHache }));
  return ouvrirSession(compte);
}

export async function connecter({ email, motDePasse }) {
  const compte = await repository.findCompteParEmail(email);
  const valide = compte?.password_hash
    ? await verifierMotDePasse(motDePasse, compte.password_hash)
    : await verifierMotDePasseFactice(motDePasse);
  if (!valide || compte.status !== 'active') {
    throw new HttpError(401, ERROR_CODES.IDENTIFIANTS_INVALIDES, 'Adresse e-mail ou mot de passe incorrect.');
  }
  await repository.enregistrerConnexion(compte.role, compte.id);
  // Ménage opportuniste des sessions expirées (sans bloquer la connexion).
  repository.purgerRefreshTokensExpires().catch(() => {});
  return ouvrirSession(compte);
}

// Rotation : le refresh token présenté est révoqué et remplacé.
export async function rafraichir(refreshToken) {
  const charge = verifierJeton(refreshToken, env.jwtRefreshSecret);
  if (!charge) throw sessionExpiree();

  const tokenHash = empreinte(refreshToken);
  const session = await repository.findRefreshTokenValide(tokenHash);
  if (!session || session.user_id !== charge.sub) throw sessionExpiree();
  // Deux refresh simultanés avec le même jeton : un seul l'emporte.
  if (!(await repository.revoquerRefreshToken(tokenHash))) throw sessionExpiree();

  const compte = await repository.findCompte(session.user_role, session.user_id);
  if (!compte || compte.status !== 'active') throw sessionExpiree();
  return ouvrirSession(compte);
}

export async function deconnecter(refreshToken) {
  if (refreshToken) await repository.revoquerRefreshToken(empreinte(refreshToken));
}

// Utilisé par le middleware d'authentification : charge de l'access token → compte.
export function lireAccessToken(accessToken) {
  return verifierJeton(accessToken, env.jwtAccessSecret);
}

export async function obtenirUtilisateur(role, id) {
  const compte = await repository.findCompte(role, id);
  if (!compte || compte.status !== 'active') {
    throw new HttpError(401, ERROR_CODES.NON_AUTHENTIFIE, 'Compte introuvable ou désactivé.');
  }
  return versUtilisateur(compte);
}
