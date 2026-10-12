// =============================================================================
// Module RESSOURCES — routes
// Responsable : Emmanuel AYA — relecture : Salem KONGOLO
// Périmètre : fiche d'une ressource, consultation et téléchargement du PDF.
// Monté sur /api/ressources dans app.js (après le module recherche).
//   GET /api/ressources/:id                  détail + indicateurs disponible / telechargeable
//   GET /api/ressources/:id/fichier          PDF en ligne (Content-Disposition: inline)
//   GET /api/ressources/:id/telechargement   PDF en pièce jointe (403 si non téléchargeable)
// =============================================================================
import express from 'express';
import { RessourceIdParamsSchema } from '@schoolbooks/shared';
import { validate } from '../../middlewares/validate.middleware.js';
import { authentifier } from '../../middlewares/auth.middleware.js';
import * as controller from './ressources.controller.js';

const router = express.Router();

const validerId = validate({ params: RessourceIdParamsSchema });

// La fiche est publique ; le document (lecture et téléchargement) est réservé
// aux comptes connectés : un apprenant s'inscrit pour accéder aux documents.
router.get('/:id', validerId, controller.obtenirRessource);
router.get('/:id/fichier', validerId, authentifier, controller.consulterFichier);
router.get('/:id/telechargement', validerId, authentifier, controller.telechargerFichier);

export default router;
