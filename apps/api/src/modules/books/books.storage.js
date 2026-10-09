// =============================================================================
// Module BOOKS — fichiers PDF envoyés par les formateurs
// Rangés sous STORAGE_DIR/uploads/books/<uuid>.pdf (hors Git, jamais servis en
// statique). Le nom est généré par l'API : le nom d'origine n'est jamais utilisé
// comme chemin. books.file_path contient le chemin relatif à STORAGE_DIR.
// =============================================================================
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { resoudreChemin } from '../ressources/storage.js';

export const DOSSIER_UPLOADS = 'uploads/books';

const SIGNATURE_PDF = Buffer.from('%PDF-');

export function estUnPdf(buffer) {
  return Buffer.isBuffer(buffer) && buffer.length > SIGNATURE_PDF.length && buffer.subarray(0, 5).equals(SIGNATURE_PDF);
}

export function empreinteFichier(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function cheminUpload(nomFichier) {
  return `${DOSSIER_UPLOADS}/${nomFichier}`;
}

export function estUnUpload(cheminRelatif) {
  return typeof cheminRelatif === 'string' && cheminRelatif.startsWith(`${DOSSIER_UPLOADS}/`);
}

// Écrit le PDF et renvoie { nomFichier, cheminFichier, tailleOctets }.
export async function enregistrerPdf(buffer) {
  const nomFichier = `${crypto.randomUUID()}.pdf`;
  const cheminFichier = cheminUpload(nomFichier);
  const absolu = resoudreChemin(cheminFichier);
  await fs.mkdir(path.dirname(absolu), { recursive: true });
  // flag wx : n'écrase jamais un fichier existant.
  await fs.writeFile(absolu, buffer, { flag: 'wx' });
  return { nomFichier, cheminFichier, tailleOctets: buffer.length };
}

// Supprime un PDF envoyé par un formateur. Les PDF du catalogue (ressources/...)
// ne sont jamais supprimés par cette voie. Un fichier déjà absent n'est pas une erreur.
export async function supprimerPdf(cheminRelatif) {
  if (!estUnUpload(cheminRelatif)) return;
  try {
    await fs.unlink(resoudreChemin(cheminRelatif));
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Suppression du PDF impossible :', error.message);
  }
}
