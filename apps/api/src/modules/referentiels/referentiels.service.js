// =============================================================================
// Module RÉFÉRENTIELS — service (logique métier)
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Lit les tables levels, tracks, subjects, document_types (migration 004) via
// referentiels.repository.js, au format du contrat (referentiels.schema.js).
// Ce service est aussi utilisé par le module recherche (Salem) pour BR02.
// =============================================================================
import { ERROR_CODES } from '@schoolbooks/shared';
import * as repository from './referentiels.repository.js';
import { HttpError } from '../../utils/http-error.js';

export async function listerNiveaux() {
  return repository.findNiveaux();
}

// Lève NIVEAU_INTROUVABLE (404) si le code de niveau n'existe pas.
export async function listerFilieres(codeNiveau) {
  const filieres = await repository.findFilieresByNiveau(codeNiveau);
  if (filieres === null) {
    throw new HttpError(404, ERROR_CODES.NIVEAU_INTROUVABLE, `Niveau introuvable : ${codeNiveau}`);
  }
  return filieres;
}

export async function listerMatieres() {
  return repository.findMatieres();
}

// Années distinctes des ressources publiées, ordre décroissant.
export async function listerAnnees() {
  return repository.findAnnees();
}

export async function listerTypesDocuments() {
  return repository.findTypesDocuments();
}

// BR02 — vérifie qu'une filière appartient bien au niveau donné.
// Lève FILIERE_INCOMPATIBLE (400) sinon. Sans niveau ou sans filière : rien à vérifier.
export async function verifierCompatibiliteFiliere(codeNiveau, codeFiliere) {
  if (!codeNiveau || !codeFiliere) return;
  const filieres = await listerFilieres(codeNiveau);
  if (!filieres.some((filiere) => filiere.code === codeFiliere)) {
    throw new HttpError(
      400,
      ERROR_CODES.FILIERE_INCOMPATIBLE,
      `La série/filière « ${codeFiliere} » n'appartient pas au niveau « ${codeNiveau} »`
    );
  }
}

export async function listerNiveauxScolaires() {
  return repository.findNiveauxScolaires();
}

export async function listerMatieresAvecId() {
  return repository.findMatieresAvecId();
}
