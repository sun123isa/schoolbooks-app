// =============================================================================
// Module BOOKS — routes, montées sur /api/books dans app.js
// Public (session facultative : un formateur voit aussi ses livres désactivés) :
//   GET    /api/books                         catalogue : q, niveau, matiere, page, limit, tri
//   GET    /api/books/:id                     fiche d'un livre
// Connecté (apprenant ou formateur) :
//   GET    /api/uploads/books/:fileName       lecture du PDF dans le navigateur
//   GET    /api/books/:id/download            téléchargement (compteur incrémenté)
// Formateur uniquement (et propriétaire du livre) :
//   GET    /api/books/trainer/mine            ses livres + statistiques du tableau de bord
//   POST   /api/books                         création (multipart, PDF dans « fichier »)
//   PATCH  /api/books/trainer/:id             modification (multipart, PDF facultatif)
//   DELETE /api/books/trainer/:id             désactivation
//   PATCH  /api/books/trainer/:id/restore     restauration
//   DELETE /api/books/trainer/:id/permanent   suppression définitive
// La lecture du PDF dans le navigateur passe par /api/uploads/books/:fileName
// (uploadsRouter ci-dessous, monté sur /api/uploads/books).
// =============================================================================
import express from 'express';
import {
  CreationLivreSchema,
  LivreIdParamsSchema,
  LivresQuerySchema,
  ModificationLivreSchema,
  NomFichierLivreParamsSchema,
  ROLES
} from '@schoolbooks/shared';
import { validate } from '../../middlewares/validate.middleware.js';
import { authentificationFacultative, authentifier, exigerRole } from '../../middlewares/auth.middleware.js';
import { recevoirPdf } from './books.upload.js';
import * as controller from './books.controller.js';

const router = express.Router();
const formateur = exigerRole(ROLES.formateur);
const validerId = validate({ params: LivreIdParamsSchema });

// Espace formateur — déclaré AVANT /:id pour que « trainer » ne soit pas lu comme un id.
router.get('/trainer/mine', formateur, controller.mesLivres);
router.patch(
  '/trainer/:id',
  formateur,
  validerId,
  recevoirPdf,
  validate({ body: ModificationLivreSchema }),
  controller.modifierLivre
);
router.delete('/trainer/:id', formateur, validerId, controller.desactiverLivre);
router.patch('/trainer/:id/restore', formateur, validerId, controller.restaurerLivre);
router.delete('/trainer/:id/permanent', formateur, validerId, controller.supprimerDefinitivement);

router.post('/', formateur, recevoirPdf, validate({ body: CreationLivreSchema }), controller.creerLivre);

// Public
router.get('/', validate({ query: LivresQuerySchema }), controller.listerLivres);
router.get('/:id', validerId, authentificationFacultative, controller.obtenirLivre);
router.get('/:id/download', validerId, authentifier, controller.telecharger);

export default router;

// GET /api/uploads/books/:fileName — PDF lu dans le navigateur (jamais de service statique).
export const uploadsRouter = express.Router();
// Lecture réservée aux comptes connectés (apprenant ou formateur).
uploadsRouter.get('/:fileName', validate({ params: NomFichierLivreParamsSchema }), authentifier, controller.lireFichier);
