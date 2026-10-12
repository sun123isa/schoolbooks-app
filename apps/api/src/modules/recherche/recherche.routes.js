// =============================================================================
// Module RECHERCHE — routes
// Responsable : Salem KONGOLO — relecture : HIRWA Jean Baptiste
// Périmètre : recherche par mot-clé combinée aux filtres, tri, pagination.
// Monté sur /api/ressources dans app.js (avant le module ressources).
//   GET /api/ressources?q=&niveau=&filiere=&matiere=&annee=&type=&page=&limit=&tri=
// =============================================================================
import express from 'express';
import { RechercheQuerySchema } from '@schoolbooks/shared';
import { validate } from '../../middlewares/validate.middleware.js';
import * as controller from './recherche.controller.js';

const router = express.Router();

router.get('/', validate({ query: RechercheQuerySchema }), controller.rechercher);

export default router;
