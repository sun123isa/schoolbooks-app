// =============================================================================
// Module RESSOURCES — accès au stockage des PDF
// Responsable : Emmanuel AYA — relecture : Salem KONGOLO
// Les PDF sont stockés sur disque, hors Git, sous env.storageDir (STORAGE_DIR).
// Ils ne sont JAMAIS servis en statique : uniquement via les routes /fichier et
// /telechargement, après vérification des droits (BR08, BR10).
// =============================================================================
import fs from 'fs/promises';
import path from 'path';
import { env } from '../../config/env.js';

// Convertit un chemin relatif (books.file_path) en chemin absolu, en refusant
// toute sortie du dossier de stockage (« ../ », chemin absolu...).
export function resoudreChemin(cheminRelatif) {
  const absolu = path.resolve(env.storageDir, cheminRelatif);
  if (!absolu.startsWith(env.storageDir + path.sep)) {
    throw new Error(`Chemin de fichier hors du stockage : ${cheminRelatif}`);
  }
  return absolu;
}

const SIGNATURE_PDF = Buffer.from('%PDF-');

// BR06 — true si le fichier du stockage existe, est lisible et est un PDF.
export async function fichierLisible(cheminRelatif) {
  if (!cheminRelatif) return false;
  try {
    return await estUnPdfLisible(resoudreChemin(cheminRelatif));
  } catch {
    return false;
  }
}

// true si le fichier (chemin absolu) est un fichier régulier qui commence par
// la signature PDF. Sert aussi à l'intégration au catalogue (fichier source).
export async function estUnPdfLisible(cheminAbsolu) {
  let fichier;
  try {
    fichier = await fs.open(cheminAbsolu, 'r');
    if (!(await fichier.stat()).isFile()) return false;
    const entete = Buffer.alloc(SIGNATURE_PDF.length);
    const { bytesRead } = await fichier.read(entete, 0, entete.length, 0);
    return bytesRead === entete.length && entete.equals(SIGNATURE_PDF);
  } catch {
    return false;
  } finally {
    await fichier?.close();
  }
}
