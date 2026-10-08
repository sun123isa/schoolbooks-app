import {
  listTrainers as listTrainersRepository,
  findTrainerById,
  createTrainer as createTrainerRepository,
  updateTrainer as updateTrainerRepository,
  deactivateTrainer as deactivateTrainerRepository
} from '../repositories/trainers.repository.js';

export async function listTrainers(filters = {}) {
  return listTrainersRepository(filters);
}

export async function getTrainerById(id) {
  const trainer = await findTrainerById(id);

  if (!trainer) {
    const error = new Error('Formateur introuvable');
    error.status = 404;
    error.code = 'TRAINER_NOT_FOUND';
    throw error;
  }

  return trainer;
}

export async function createTrainer(data) {
  return createTrainerRepository(data);
}

export async function updateTrainer(id, data) {
  const trainer = await updateTrainerRepository(id, data);

  if (!trainer) {
    const error = new Error('Formateur introuvable');
    error.status = 404;
    error.code = 'TRAINER_NOT_FOUND';
    throw error;
  }

  return trainer;
}

export async function deactivateTrainer(id) {
  const trainer = await deactivateTrainerRepository(id);

  if (!trainer) {
    const error = new Error('Formateur introuvable');
    error.status = 404;
    error.code = 'TRAINER_NOT_FOUND';
    throw error;
  }

  return trainer;
}