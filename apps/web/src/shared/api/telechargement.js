// =============================================================================
// Socle frontend — téléchargement d'un PDF réservé aux comptes connectés
// Le fichier est récupéré avec les cookies de session (refresh si besoin) puis
// proposé à l'enregistrement. Les erreurs (401, 403, 404) remontent en ApiError
// pour être affichées dans la page.
// =============================================================================
import { ApiError, rafraichirSession, resolveApiUrl } from './client.js';

function nomDepuisEntete(entete) {
  const resultat = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(entete ?? '');
  return resultat ? decodeURIComponent(resultat[1]) : 'document.pdf';
}

export async function telechargerFichier(urlTelechargement) {
  const url = resolveApiUrl(urlTelechargement);
  const demander = () => fetch(url, { credentials: 'include' });

  let response;
  try {
    response = await demander();
    if (response.status === 401 && (await rafraichirSession())) response = await demander();
  } catch {
    throw new ApiError(0, 'RESEAU', 'Impossible de joindre le serveur. Vérifiez votre connexion.');
  }

  if (!response.ok) {
    const corps = await response.json().catch(() => null);
    throw new ApiError(response.status, corps?.error?.code ?? 'INTERNAL_ERROR', corps?.error?.message ?? 'Téléchargement impossible.');
  }

  const blob = await response.blob();
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(blob);
  lien.download = nomDepuisEntete(response.headers.get('Content-Disposition'));
  document.body.append(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(lien.href), 10_000);
}
