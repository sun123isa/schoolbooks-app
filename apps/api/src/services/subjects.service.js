import {
  findAllSubjects,
  findSubjectById,
  findSubjectByCode
} from '../repositories/subjects.repository.js';

// Retourne la liste des matières.
export async function listSubjects(options = {}) {
  return findAllSubjects(options);
}

// Retourne une matière par son ID.
export async function getSubjectById(id) {
  const subject = await findSubjectById(id);

  if (!subject) {
    const error = new Error('Matière introuvable');
    error.status = 404;
    error.code = 'SUBJECT_NOT_FOUND';
    throw error;
  }

  return subject;
}

// Retourne une matière par son code.
export async function getSubjectByCode(code) {
  const subject = await findSubjectByCode(code);

  if (!subject) {
    const error = new Error('Matière introuvable');
    error.status = 404;
    error.code = 'SUBJECT_NOT_FOUND';
    throw error;
  }

  return subject;
}