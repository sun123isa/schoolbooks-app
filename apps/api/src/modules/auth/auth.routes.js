// =============================================================================
// Module AUTH — routes, montées sur /api/auth dans app.js
//   POST /api/auth/register/learner   inscription d'un apprenant (ouvre la session)
//   POST /api/auth/register/trainer   inscription d'un formateur (ouvre la session)
//   POST /api/auth/login              connexion
//   POST /api/auth/refresh            nouveau couple de jetons (cookie sb_refresh)
//   GET  /api/auth/me                 utilisateur connecté (restauration de session)
//   POST /api/auth/logout             révoque la session et efface les cookies
// =============================================================================
import express from 'express';
import { ConnexionSchema, InscriptionApprenantSchema, InscriptionFormateurSchema } from '@schoolbooks/shared';
import { validate } from '../../middlewares/validate.middleware.js';
import { authentifier } from '../../middlewares/auth.middleware.js';
import { limiterDebit } from '../../middlewares/rate-limit.middleware.js';
import * as controller from './auth.controller.js';

const router = express.Router();

// Anti-force brute : 20 tentatives de connexion / inscription par IP et par quart d'heure.
const limiteIdentification = limiterDebit({ fenetreMs: 15 * 60 * 1000, max: 20 });

router.post(
  '/register/learner',
  limiteIdentification,
  validate({ body: InscriptionApprenantSchema }),
  controller.inscrireApprenant
);
router.post(
  '/register/trainer',
  limiteIdentification,
  validate({ body: InscriptionFormateurSchema }),
  controller.inscrireFormateur
);
router.post('/login', limiteIdentification, validate({ body: ConnexionSchema }), controller.connecter);
router.post('/refresh', controller.rafraichir);
router.get('/me', authentifier, controller.moi);
router.post('/logout', controller.deconnecter);

export default router;
