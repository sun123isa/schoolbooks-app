import * as trainersService from '../services/trainers.service.js';

export async function listTrainersController(req, res, next) {
  try {
    const specialty =
      typeof req.query.specialty === 'string'
        ? req.query.specialty.trim()
        : undefined;

    const status =
      typeof req.query.status === 'string'
        ? req.query.status.trim()
        : undefined;

    const trainers = await trainersService.listTrainers({
      specialty,
      status
    });

    res.json({
      success: true,
      data: {
        items: trainers,
        count: trainers.length
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrainerController(req, res, next) {
  try {
    const trainer = await trainersService.getTrainerById(
      req.params.id
    );

    res.json({
      success: true,
      data: trainer
    });
  } catch (error) {
    next(error);
  }
}

export async function createTrainerController(req, res, next) {
  try {
    const trainer = await trainersService.createTrainer(req.body);

    res.status(201).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTrainerController(req, res, next) {
  try {
    const trainer = await trainersService.updateTrainer(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: trainer
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTrainerController(req, res, next) {
  try {
    const trainer = await trainersService.deactivateTrainer(
      req.params.id
    );

    res.json({
      success: true,
      data: trainer
    });
  } catch (error) {
    next(error);
  }
}