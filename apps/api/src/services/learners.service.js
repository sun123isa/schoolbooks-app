import {
  listLearners as listLearnersRepository,
  findLearnerById,
  createLearner as createLearnerRepository,
  updateLearner as updateLearnerRepository,
  deactivateLearner as deactivateLearnerRepository
} from '../repositories/learners.repository.js';

export async function listLearners() {
  return listLearnersRepository();
}

export async function getLearnerById(id) {
  const learner = await findLearnerById(id);

  if (!learner) {
    const error = new Error('Apprenant introuvable');
    error.status = 404;
    error.code = 'LEARNER_NOT_FOUND';
    throw error;
  }

  return learner;
}

export async function createLearner(data) {
  return createLearnerRepository(data);
}

export async function updateLearner(id, data) {
  const learner = await updateLearnerRepository(id, data);

  if (!learner) {
    const error = new Error('Apprenant introuvable');
    error.status = 404;
    error.code = 'LEARNER_NOT_FOUND';
    throw error;
  }

  return learner;
}

export async function deactivateLearner(id) {
  const learner = await deactivateLearnerRepository(id);

  if (!learner) {
    const error = new Error('Apprenant introuvable');
    error.status = 404;
    error.code = 'LEARNER_NOT_FOUND';
    throw error;
  }

  return learner;
}