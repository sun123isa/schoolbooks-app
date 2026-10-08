import express from 'express';

import {
  listSchoolLevelsController,
  getSchoolLevelController,
  getSchoolLevelByCodeController
} from '../controllers/levels.controller.js';

import {
  schoolLevelIdParamsSchema,
  schoolLevelCodeParamsSchema,
  validateSchoolLevelParams
} from '../validators/levels.validator.js';

const router = express.Router();

// GET /api/school-levels
// Liste tous les niveaux actifs.
router.get('/', listSchoolLevelsController);

// GET /api/school-levels/code/:code
// Cette route doit être déclarée avant /:id.
// Sinon "code" pourrait être interprété comme un id.
router.get(
  '/code/:code',
  validateSchoolLevelParams(schoolLevelCodeParamsSchema),
  getSchoolLevelByCodeController
);

// GET /api/school-levels/:id
// Récupère un niveau par UUID.
router.get(
  '/:id',
  validateSchoolLevelParams(schoolLevelIdParamsSchema),
  getSchoolLevelController
);

export default router;