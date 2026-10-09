// =============================================================================
// Module AUTH — cookies de session (HTTP-only)
//   sb_access  : access token, envoyé sur toute l'API (/api), courte durée ;
//   sb_refresh : refresh token, envoyé UNIQUEMENT aux routes /api/auth
//                (refresh, logout), longue durée.
// HttpOnly : inaccessibles au JavaScript de la page (protection contre le vol
// par XSS). SameSite=Lax : non envoyés par les formulaires d'autres sites (CSRF).
// Secure en production (HTTPS obligatoire).
// =============================================================================
import { env } from '../../config/env.js';

export const COOKIE_ACCESS = 'sb_access';
export const COOKIE_REFRESH = 'sb_refresh';

const CHEMIN_ACCESS = '/api';
const CHEMIN_REFRESH = '/api/auth';

function options(chemin, dureeSecondes) {
  return {
    httpOnly: true,
    // SameSite=None impose Secure (exigence des navigateurs).
    secure: env.nodeEnv === 'production' || env.cookieSameSite === 'none',
    sameSite: env.cookieSameSite,
    path: chemin,
    ...(dureeSecondes ? { maxAge: dureeSecondes * 1000 } : {})
  };
}

export function poserCookiesSession(res, { accessToken, refreshToken }) {
  res.cookie(COOKIE_ACCESS, accessToken, options(CHEMIN_ACCESS, env.accessTokenTtl));
  res.cookie(COOKIE_REFRESH, refreshToken, options(CHEMIN_REFRESH, env.refreshTokenTtl));
}

export function effacerCookiesSession(res) {
  res.clearCookie(COOKIE_ACCESS, options(CHEMIN_ACCESS));
  res.clearCookie(COOKIE_REFRESH, options(CHEMIN_REFRESH));
}

// Lecture de l'en-tête Cookie (évite une dépendance à cookie-parser).
export function lireCookie(req, nom) {
  const entete = req.headers.cookie;
  if (!entete) return undefined;
  for (const morceau of entete.split(';')) {
    const index = morceau.indexOf('=');
    if (index === -1) continue;
    if (morceau.slice(0, index).trim() === nom) {
      try {
        return decodeURIComponent(morceau.slice(index + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}
