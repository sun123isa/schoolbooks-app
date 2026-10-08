import express from 'express';

import {
  registerLearnerController,
  registerTrainerController,
  loginController,
  refreshController,
  logoutController,
  meController
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  registerLearnerSchema,
  registerTrainerSchema,
  loginSchema,
  validateAuthBody
} from '../validators/auth.validator.js';

const router = express.Router();


router.get(
  '/me',
  requireAuth,
  meController
);
router.post(
  '/register/learner',
  validateAuthBody(registerLearnerSchema),
  registerLearnerController
);

router.post(
  '/register/trainer',
  validateAuthBody(registerTrainerSchema),
  registerTrainerController
);

router.post(
  '/login',
  validateAuthBody(loginSchema),
  loginController
);

router.post('/refresh', refreshController);

router.post('/logout', logoutController);

export default router;