// =============================================================================
// Module AUTH — primitives cryptographiques (node:crypto, sans dépendance)
//   - mots de passe : scrypt avec sel aléatoire, comparaison à temps constant ;
//   - jetons : JWT HS256 (en-tête.charge.signature, base64url) avec expiration ;
//   - empreinte SHA-256 des refresh tokens stockés en base.
// =============================================================================
import crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);
const LONGUEUR_CLE = 64;

// Format stocké : scrypt$<sel hex>$<clé hex>
export async function hacherMotDePasse(motDePasse) {
  const sel = crypto.randomBytes(16).toString('hex');
  const cle = await scrypt(motDePasse, sel, LONGUEUR_CLE);
  return `scrypt$${sel}$${cle.toString('hex')}`;
}

export async function verifierMotDePasse(motDePasse, hache) {
  const [algo, sel, cleHex] = String(hache ?? '').split('$');
  if (algo !== 'scrypt' || !sel || !cleHex) return false;
  const attendue = Buffer.from(cleHex, 'hex');
  const calculee = await scrypt(motDePasse, sel, attendue.length);
  return attendue.length === calculee.length && crypto.timingSafeEqual(attendue, calculee);
}

// Hachage factice : la connexion avec un e-mail inconnu prend le même temps
// qu'avec un mauvais mot de passe (pas d'énumération des comptes par le délai).
let hacheFactice;
export async function verifierMotDePasseFactice(motDePasse) {
  hacheFactice ??= await hacherMotDePasse('mot-de-passe-factice-1');
  await verifierMotDePasse(motDePasse, hacheFactice);
  return false;
}

const base64url = (donnees) => Buffer.from(donnees).toString('base64url');

function signature(contenu, secret) {
  return crypto.createHmac('sha256', secret).update(contenu).digest('base64url');
}

// Charge : { sub, role, ... } ; iat/exp ajoutés (secondes). jti aléatoire :
// deux jetons émis la même seconde restent distincts.
export function signerJeton(charge, secret, dureeSecondes) {
  const maintenant = Math.floor(Date.now() / 1000);
  const entete = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const corps = base64url(
    JSON.stringify({ ...charge, jti: crypto.randomUUID(), iat: maintenant, exp: maintenant + dureeSecondes })
  );
  return `${entete}.${corps}.${signature(`${entete}.${corps}`, secret)}`;
}

// Renvoie la charge si le jeton est authentique et non expiré, sinon null.
export function verifierJeton(jeton, secret) {
  if (typeof jeton !== 'string') return null;
  const parties = jeton.split('.');
  if (parties.length !== 3) return null;
  const [entete, corps, signatureRecue] = parties;
  const attendue = Buffer.from(signature(`${entete}.${corps}`, secret));
  const recue = Buffer.from(signatureRecue);
  if (attendue.length !== recue.length || !crypto.timingSafeEqual(attendue, recue)) return null;
  try {
    const { alg } = JSON.parse(Buffer.from(entete, 'base64url').toString('utf8'));
    if (alg !== 'HS256') return null;
    const charge = JSON.parse(Buffer.from(corps, 'base64url').toString('utf8'));
    if (typeof charge.exp !== 'number' || charge.exp <= Math.floor(Date.now() / 1000)) return null;
    return charge;
  } catch {
    return null;
  }
}

export function empreinte(texte) {
  return crypto.createHash('sha256').update(texte).digest('hex');
}
