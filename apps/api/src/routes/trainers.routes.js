import express from 'express';

import {
  listTrainersController,
  getTrainerController,
  createTrainerController,
  updateTrainerController,
  deleteTrainerController
} from '../controllers/trainers.controller.js';

import {
  trainerIdParamsSchema,
  createTrainerBodySchema,
  updateTrainerBodySchema,
  validateTrainerParams,
  validateTrainerBody
} from '../validators/trainers.validator.js';

const router = express.Router();

router.get('/', listTrainersController);

router.post(
  '/',
  validateTrainerBody(createTrainerBodySchema),
  createTrainerController
);

router.get(
  '/:id',
  validateTrainerParams(trainerIdParamsSchema),
  getTrainerController
);

router.patch(
  '/:id',
  validateTrainerParams(trainerIdParamsSchema),
  validateTrainerBody(updateTrainerBodySchema),
  updateTrainerController
);

router.delete(
  '/:id',
  validateTrainerParams(trainerIdParamsSchema),
  deleteTrainerController
);

export default router;