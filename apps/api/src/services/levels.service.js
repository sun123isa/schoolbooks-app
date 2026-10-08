import {
  findAllSchoolLevels,
  findSchoolLevelById,
  findSchoolLevelByCode
} from '../repositories/levels.repository.js';

// Retourne les niveaux scolaires disponibles.
export async function listSchoolLevels(options = {}) {
  return findAllSchoolLevels(options);
}

// Retourne un niveau par son ID.
export async function getSchoolLevelById(id) {
  const schoolLevel = await findSchoolLevelById(id);

  if (!schoolLevel) {
    const error = new Error('Niveau scolaire introuvable');
    error.status = 404;
    error.code = 'SCHOOL_LEVEL_NOT_FOUND';
    throw error;
  }

  return schoolLevel;
}

// Retourne un niveau par son code.
export async function getSchoolLevelByCode(code) {
  const schoolLevel = await findSchoolLevelByCode(code);

  if (!schoolLevel) {
    const error = new Error('Niveau scolaire introuvable');
    error.status = 404;
    error.code = 'SCHOOL_LEVEL_NOT_FOUND';
    throw error;
  }

  return schoolLevel;
}