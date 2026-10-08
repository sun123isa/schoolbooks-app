import express from 'express';

import {
  listSubjectsController,
  getSubjectController,
  getSubjectByCodeController
} from '../controllers/subjects.controller.js';

import {
  subjectIdParamsSchema,
  subjectCodeParamsSchema,
  validateSubjectParams
} from '../validators/subjects.validator.js';

const router = express.Router();

router.get('/', listSubjectsController);

router.get(
  '/code/:code',
  validateSubjectParams(subjectCodeParamsSchema),
  getSubjectByCodeController
);

router.get(
  '/:id',
  validateSubjectParams(subjectIdParamsSchema),
  getSubjectController
);

export default router;