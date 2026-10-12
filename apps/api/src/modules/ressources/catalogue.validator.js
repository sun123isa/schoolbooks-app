// =============================================================================
// Module RESSOURCES — validation d'une ressource avant intégration au catalogue
// Responsable : Emmanuel AYA — relecture : Salem KONGOLO
// Utilisé par le script d'import (npm run catalogue:importer -- fichier.json) ;
// pas exposé aux utilisateurs (pas de route publique d'upload, hors MVP).
//   - BR01/BR03/BR05 : niveau, matière et type obligatoires et existants ;
//   - BR02 : filière compatible avec le niveau ;
//   - BR04 : année obligatoire si le type l'exige (requiertAnnee) ;
//   - BR06 : le fichier source est un PDF lisible ;
//   - BR09 : aucun doublon (empreinte SHA-256, ou même titre/niveau/matière/type/année) ;
//   - BR10 : droits d'utilisation renseignés, téléchargement interdit par défaut.
// Erreurs : RESSOURCE_INCOMPLETE (422), FILIERE_INCOMPATIBLE (400), DOUBLON (409).
// =============================================================================
import crypto from 'crypto';
import { createReadStream } from 'fs';
import fs from 'fs/promises';
import { z } from 'zod';
import { CodeSchema, ERROR_CODES } from '@schoolbooks/shared';
import { HttpError } from '../../utils/http-error.js';
import * as referentiels from '../referentiels/referentiels.service.js';
import { findDoublon } from './ressources.repository.js';
import { estUnPdfLisible } from './storage.js';

export const RessourceCatalogueSchema = z.object({
  titre: z.string().trim().min(3).max(255),
  description: z.string().trim().optional(),
  auteur: z.string().trim().max(255).optional(),
  niveau: CodeSchema, // BR01 — obligatoire
  filiere: CodeSchema.optional(), // BR02 — compatibilité vérifiée plus bas
  matiere: CodeSchema, // BR03 — obligatoire
  type: CodeSchema, // BR05 — obligatoire
  annee: z.number().int().min(1950).max(2100).optional(), // BR04 — obligatoire selon le type
  telechargeable: z.boolean().default(false), // BR10 — interdit par défaut
  droits: z.string().trim().min(3), // BR10 — source / licence / ayant droit obligatoire
  fichier: z.string().trim().min(1) // chemin du PDF source à intégrer
});

const incomplete = (details) =>
  new HttpError(422, ERROR_CODES.RESSOURCE_INCOMPLETE, 'Ressource incomplète ou invalide', details);

// Empreinte SHA-256 du fichier, lue en flux (pas de chargement complet en mémoire).
export function empreinteFichier(chemin) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    createReadStream(chemin)
      .on('error', reject)
      .on('data', (morceau) => hash.update(morceau))
      .on('end', () => resolve(hash.digest('hex')));
  });
}

// Renvoie les données validées, complétées de l'empreinte et de la taille du fichier.
export async function validerRessourceCatalogue(donnees) {
  const resultat = RessourceCatalogueSchema.safeParse(donnees);
  if (!resultat.success) {
    throw incomplete(
      resultat.error.issues.map((issue) => ({ champ: issue.path.join('.') || '(racine)', message: issue.message }))
    );
  }
  const ressource = resultat.data;

  // BR01/BR03/BR05 : les codes existent dans les référentiels.
  const [niveaux, matieres, types] = await Promise.all([
    referentiels.listerNiveaux(),
    referentiels.listerMatieres(),
    referentiels.listerTypesDocuments()
  ]);
  const details = [];
  if (!niveaux.some((n) => n.code === ressource.niveau)) {
    details.push({ champ: 'niveau', message: `Niveau inconnu : ${ressource.niveau}` });
  }
  if (!matieres.some((m) => m.code === ressource.matiere)) {
    details.push({ champ: 'matiere', message: `Matière inconnue : ${ressource.matiere}` });
  }
  const type = types.find((t) => t.code === ressource.type);
  if (!type) {
    details.push({ champ: 'type', message: `Type de document inconnu : ${ressource.type}` });
  } else if (type.requiertAnnee && ressource.annee === undefined) {
    // BR04
    details.push({ champ: 'annee', message: `L'année est obligatoire pour le type « ${type.libelle} »` });
  }
  // BR06 : le fichier source est un PDF lisible.
  if (!(await estUnPdfLisible(ressource.fichier))) {
    details.push({ champ: 'fichier', message: `Fichier absent, illisible ou non PDF : ${ressource.fichier}` });
  }
  if (details.length > 0) throw incomplete(details);

  // BR02 : la filière appartient au niveau.
  await referentiels.verifierCompatibiliteFiliere(ressource.niveau, ressource.filiere);

  // BR09 : doublon par empreinte ou par métadonnées.
  const [empreinte, { size: tailleOctets }] = await Promise.all([
    empreinteFichier(ressource.fichier),
    fs.stat(ressource.fichier)
  ]);
  const doublon = await findDoublon({ fileChecksum: empreinte, ...ressource });
  if (doublon) {
    throw new HttpError(409, ERROR_CODES.DOUBLON, `Ressource déjà présente au catalogue : « ${doublon.title} » (${doublon.id})`);
  }

  return { ...ressource, empreinte, tailleOctets };
}
