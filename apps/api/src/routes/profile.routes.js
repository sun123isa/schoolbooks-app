import express from 'express';

import { requireAuth } from '../middlewares/auth.middleware.js';

import { updateProfileController } from '../controllers/profile.controller.js';

import { validateProfileBody } from '../validators/profile.validator.js';

const router = express.Router();

router.patch(
  '/me',
  requireAuth,
  validateProfileBody,
  updateProfileController
);

export default router;