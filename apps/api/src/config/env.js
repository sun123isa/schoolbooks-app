// =============================================================================
// Socle backend — configuration lue depuis les variables d'environnement
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Toute nouvelle variable est ajoutée ici ET dans apps/api/.env.example.
// =============================================================================
import path from 'path';
import { fileURLToPath } from 'url';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // Origines autorisées par CORS : CLIENT_URL peut en lister plusieurs (virgules).
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  // Dossier racine des PDF du catalogue, hors Git. Les colonnes books.file_path
  // des ressources sont relatives à ce dossier (ex : « ressources/bac-c-2023.pdf »).
  storageDir: path.resolve(apiRoot, process.env.STORAGE_DIR || 'storage'),
  // Authentification : secrets de signature des jetons (obligatoires en production).
  jwtAccessSecret: secret('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: secret('JWT_REFRESH_SECRET'),
  // Durées de vie, en secondes : 15 minutes et 7 jours par défaut.
  accessTokenTtl: Number(process.env.ACCESS_TOKEN_TTL) || 15 * 60,
  refreshTokenTtl: Number(process.env.REFRESH_TOKEN_TTL) || 7 * 24 * 60 * 60,
  // SameSite des cookies de session : « lax » (défaut) quand le frontend appelle
  // l'API sur la même origine (proxy /api de Vite, Netlify ou Vercel) ; « none »
  // si le frontend appelle directement l'API sur un autre domaine (HTTPS requis).
  cookieSameSite: ['lax', 'strict', 'none'].includes(process.env.COOKIE_SAMESITE) ? process.env.COOKIE_SAMESITE : 'lax'
};

// En développement et en test, un secret par défaut évite de bloquer le
// démarrage ; en production, l'absence de secret arrête l'API.
function secret(nom) {
  const valeur = process.env[nom];
  if (valeur) return valeur;
  if ((process.env.NODE_ENV || 'development') === 'production') {
    throw new Error(`Variable d'environnement manquante : ${nom}`);
  }
  return `dev-${nom}-a-changer`;
}
