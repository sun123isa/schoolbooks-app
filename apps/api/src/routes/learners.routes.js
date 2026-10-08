import express from 'express';

import {
  listLearnersController,
  getLearnerController,
  createLearnerController,
  updateLearnerController,
  deleteLearnerController
} from '../controllers/learners.controller.js';

import {
  learnerIdParamsSchema,
  createLearnerBodySchema,
  updateLearnerBodySchema,
  validateLearnerParams,
  validateLearnerBody
} from '../validators/learners.validator.js';

const router = express.Router();

router.get('/', listLearnersController);

router.post(
  '/',
  validateLearnerBody(createLearnerBodySchema),
  createLearnerController
);

router.get(
  '/:id',
  validateLearnerParams(learnerIdParamsSchema),
  getLearnerController
);

router.patch(
  '/:id',
  validateLearnerParams(learnerIdParamsSchema),
  validateLearnerBody(updateLearnerBodySchema),
  updateLearnerController
);

router.delete(
  '/:id',
  validateLearnerParams(learnerIdParamsSchema),
  deleteLearnerController
);

export default router;