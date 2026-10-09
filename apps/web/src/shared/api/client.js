// =============================================================================
// Socle frontend — client API
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Périmètre : unique point d'accès HTTP vers l'API. Les pages n'appellent jamais
// fetch directement : elles passent par leur fichier <page>.api.js, qui utilise
// apiGet(). Gère l'URL de base, la query string, le format d'erreur commun et
// le mode mock (VITE_USE_MOCKS=true) pour travailler sans backend.
// =============================================================================
import { API_PREFIX, API_ROUTES } from '@schoolbooks/shared';

// En développement, Vite redirige /api vers le backend (voir vite.config.js) :
// frontend et API partagent la même origine (pas de souci CORS ni d'iframe PDF).
export const API_BASE_URL = import.meta.env.VITE_API_URL || API_PREFIX;
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Erreur normalisée : `code` correspond à ERROR_CODES (@schoolbooks/shared).
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Construit /api/xxx?a=1&b=2 en ignorant les paramètres vides.
export function buildUrl(path, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.append(key, String(value).trim());
    }
  }
  const qs = query.toString();
  return `${API_BASE_URL}${path}${qs ? `?${qs}` : ''}`;
}

// Transforme un chemin renvoyé par l'API (ex : /api/ressources/:id/fichier) en
// URL utilisable par le navigateur (lien, iframe, visionneuse).
export function resolveApiUrl(apiPath) {
  if (!apiPath) return null;
  if (/^https?:\/\//.test(apiPath)) return apiPath;
  return apiPath.startsWith(API_PREFIX) ? `${API_BASE_URL}${apiPath.slice(API_PREFIX.length)}` : apiPath;
}

// --- Session (cookies HTTP-only) -------------------------------------------------
// Les jetons ne sont jamais lisibles ici : le navigateur envoie les cookies
// (credentials: 'include'). Quand l'access token a expiré (401 NON_AUTHENTIFIE),
// le client demande UNE fois un nouveau couple de jetons (/auth/refresh) puis
// rejoue la requête. Les refresh simultanés sont regroupés en un seul appel
// (le refresh token est à usage unique côté API).
export const EVENEMENT_SESSION_EXPIREE = 'schoolbooks:session-expiree';
let rafraichissementEnCours = null;

export function rafraichirSession() {
  rafraichissementEnCours ??= fetch(`${API_BASE_URL}${API_ROUTES.auth.rafraichir}`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' }
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      rafraichissementEnCours = null;
    });
  return rafraichissementEnCours;
}

const ROUTES_SANS_REFRESH = new Set([
  API_ROUTES.auth.connexion,
  API_ROUTES.auth.rafraichir,
  API_ROUTES.auth.deconnexion,
  API_ROUTES.auth.inscriptionApprenant,
  API_ROUTES.auth.inscriptionFormateur
]);

async function envoyer(method, path, { params, body, signal }) {
  const headers = { Accept: 'application/json' };
  let corps;
  if (body instanceof FormData) {
    corps = body; // multipart : le navigateur pose lui-même Content-Type et la frontière.
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    corps = JSON.stringify(body);
  }
  try {
    return await fetch(buildUrl(path, params), { method, headers, body: corps, signal, credentials: 'include' });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(0, 'RESEAU', 'Impossible de joindre le serveur. Vérifiez votre connexion.');
  }
}

/**
 * Requête JSON sur l'API. Renvoie directement `data` de l'enveloppe { success, data }.
 * @param {'GET'|'POST'|'PATCH'|'DELETE'} method
 * @param {string} path - chemin relatif à /api (utiliser API_ROUTES).
 * @param {{ params?: object, body?: object|FormData, mock?: () => Promise<any>, signal?: AbortSignal }} options
 *   mock : fonction utilisée à la place de l'appel réseau si USE_MOCKS est actif.
 */
export async function apiRequest(method, path, { params, body, mock, signal } = {}) {
  if (USE_MOCKS && mock) {
    // Petit délai pour rendre visibles les états de chargement.
    await new Promise((resolve) => setTimeout(resolve, 250));
    return mock();
  }

  let response = await envoyer(method, path, { params, body, signal });
  if (response.status === 401 && !ROUTES_SANS_REFRESH.has(path)) {
    const erreur = await response.clone().json().catch(() => null);
    if (erreur?.error?.code === 'NON_AUTHENTIFIE') {
      if (await rafraichirSession()) {
        response = await envoyer(method, path, { params, body, signal });
      } else {
        window.dispatchEvent(new Event(EVENEMENT_SESSION_EXPIREE));
      }
    }
  }

  const reponse = await response.json().catch(() => null);
  if (!response.ok || !reponse?.success) {
    throw new ApiError(
      response.status,
      reponse?.error?.code ?? 'INTERNAL_ERROR',
      reponse?.error?.message ?? `Erreur HTTP ${response.status}`,
      reponse?.error?.details
    );
  }
  return reponse.data;
}

export function apiGet(path, options) {
  return apiRequest('GET', path, options);
}

export function apiPost(path, body, options = {}) {
  return apiRequest('POST', path, { ...options, body });
}

export function apiPatch(path, body, options = {}) {
  return apiRequest('PATCH', path, { ...options, body });
}

export function apiDelete(path, options) {
  return apiRequest('DELETE', path, options);
}
