// =============================================================================
// Module RÉFÉRENTIELS — routes
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Périmètre : données alimentant les filtres et le parcours de la landing page.
// Monté sur /api dans app.js.
//   GET /api/niveaux
//   GET /api/niveaux/:code/filieres   (BR02 : filières du niveau uniquement)
//   GET /api/matieres
//   GET /api/annees
//   GET /api/types-documents
// =============================================================================
import express from 'express';
import { z } from 'zod';
import { CodeSchema } from '@schoolbooks/shared';
import { validate } from '../../middlewares/validate.middleware.js';
import * as controller from './referentiels.controller.js';

const router = express.Router();

router.get('/niveaux', controller.listerNiveaux);
router.get(
  '/niveaux/:code/filieres',
  validate({ params: z.object({ code: CodeSchema }) }),
  controller.listerFilieres
);
router.get('/matieres', controller.listerMatieres);
router.get('/annees', controller.listerAnnees);
router.get('/types-documents', controller.listerTypesDocuments);

// Référentiels des comptes et des livres (avec identifiants).
//   GET /api/school-levels   niveaux + séries/filières
//   GET /api/subjects        matières
router.get('/school-levels', controller.listerNiveauxScolaires);
router.get('/subjects', controller.listerMatieresAvecId);

export default router;
