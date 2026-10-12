// =============================================================================
// Module RESSOURCES — service
// Responsable : Emmanuel AYA — relecture : Salem KONGOLO
// Détail d'une ressource (RessourceDetailSchema), consultation et téléchargement
// du PDF stocké sous STORAGE_DIR (storage.js).
//   - BR06 : `disponible` = fichier présent et lisible ; sinon 404 FICHIER_INDISPONIBLE ;
//   - BR08 : téléchargement réservé aux ressources téléchargeables (sinon 403) ;
//   - BR10 : file_path et chemin disque ne sont jamais renvoyés au client.
// =============================================================================
import { API_PREFIX, API_ROUTES, ERROR_CODES } from '@schoolbooks/shared';
import { HttpError } from '../../utils/http-error.js';
import * as repository from './ressources.repository.js';
import { versResume } from './ressource.sql.js';
import { fichierLisible, resoudreChemin } from './storage.js';

// Nom proposé au navigateur : dérivé du titre, sans caractère problématique.
function nomDeFichier(titre) {
  const base = titre
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `${base || 'ressource'}.pdf`;
}

// RESSOURCE_INTROUVABLE (404) si l'id est inconnu ou la ressource retirée.
async function trouverLigne(id) {
  const ligne = await repository.findRessourceById(id);
  if (!ligne) {
    throw new HttpError(404, ERROR_CODES.RESSOURCE_INTROUVABLE, "Cette ressource n'existe pas ou n'est plus disponible.");
  }
  return ligne;
}

export async function obtenirRessource(id) {
  const ligne = await trouverLigne(id);
  const disponible = await fichierLisible(ligne.file_path);
  const telechargeable = ligne.is_downloadable;

  return {
    ...versResume(ligne),
    description: ligne.description ?? null,
    auteur: ligne.author ?? null,
    // BIGINT est renvoyé en chaîne par pg : conversion explicite.
    tailleOctets: ligne.file_size === null ? null : Number(ligne.file_size),
    disponible,
    droits: ligne.usage_rights ?? null,
    dateAjout: new Date(ligne.created_at).toISOString(),
    urls: {
      fichier: disponible ? `${API_PREFIX}${API_ROUTES.fichier(ligne.id)}` : null,
      telechargement: disponible && telechargeable ? `${API_PREFIX}${API_ROUTES.telechargement(ligne.id)}` : null
    }
  };
}

// BR06 — FICHIER_INDISPONIBLE (404) si le PDF ne peut pas être ouvert.
async function fichierDe(ligne) {
  if (!(await fichierLisible(ligne.file_path))) {
    throw new HttpError(404, ERROR_CODES.FICHIER_INDISPONIBLE, 'Le document PDF de cette ressource est inaccessible.');
  }
  return { cheminAbsolu: resoudreChemin(ligne.file_path), nomFichier: nomDeFichier(ligne.title) };
}

export async function obtenirFichierConsultable(id) {
  return fichierDe(await trouverLigne(id));
}

// BR08 — TELECHARGEMENT_NON_AUTORISE (403) si la ressource n'est pas téléchargeable.
// Le droit est vérifié avant le fichier : une ressource non téléchargeable
// répond toujours 403, que son fichier soit présent ou non.
export async function obtenirFichierTelechargeable(id) {
  const ligne = await trouverLigne(id);
  if (!ligne.is_downloadable) {
    throw new HttpError(403, ERROR_CODES.TELECHARGEMENT_NON_AUTORISE, "Cette ressource est consultable en ligne mais n'est pas téléchargeable.");
  }
  return fichierDe(ligne);
}

// Appelé après un envoi réussi du fichier en pièce jointe.
export async function enregistrerTelechargement(id) {
  await repository.incrementerTelechargements(id);
}
