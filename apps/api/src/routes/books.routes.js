import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

import {
  listBooksController,
  getBookController,
  createBookController,
  updateBookController,
  deleteBookController,
  downloadBookController,
  listTrainerBooksController,
  updateTrainerBookController,
  deactivateTrainerBookController,
  activateTrainerBookController,
  deleteTrainerBookController
} from '../controllers/books.controller.js';

import {
  bookIdParamsSchema,
  createBookBodySchema,
  updateBookBodySchema,
  validateBookParams,
  validateBookBody
} from '../validators/books.validator.js';

import {
  requireAuth
} from '../middlewares/auth.middleware.js';

import {
  requireRole
} from '../middlewares/role.middleware.js';

const router = express.Router();

// -----------------------------------------------------------------------------
// Chemins
// -----------------------------------------------------------------------------

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

// Si ce fichier est situé dans :
// apps/api/src/routes/books.routes.js
//
// alors ce chemin pointe vers :
// apps/api/uploads/books
const uploadDirectory = path.resolve(
  currentDirectory,
  '../../uploads/books'
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true
  });
}

console.log(
  'Dossier de stockage des livres :',
  uploadDirectory
);

// -----------------------------------------------------------------------------
// Configuration Multer
// -----------------------------------------------------------------------------

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    callback(null, `${uuidv4()}.pdf`);
  }
});

const fileFilter = (req, file, callback) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const isPdfMimeType =
    file.mimetype === 'application/pdf';

  const isPdfExtension =
    extension === '.pdf';

  if (
    !isPdfMimeType ||
    !isPdfExtension
  ) {
    const error = new Error(
      'Seuls les fichiers PDF sont acceptés'
    );

    error.status = 400;
    error.code = 'INVALID_FILE_TYPE';

    return callback(error, false);
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 1
  }
});

// -----------------------------------------------------------------------------
// Routes publiques
// -----------------------------------------------------------------------------

// GET /api/books
// Liste les livres actifs.
router.get(
  '/',
  listBooksController
);

// -----------------------------------------------------------------------------
// Routes nécessitant une authentification
// -----------------------------------------------------------------------------

// POST /api/books
// Ajoute un livre PDF.
router.post(
  '/',
  requireAuth,
  requireRole('trainer'),
  upload.single('file'),
  validateBookBody(createBookBodySchema),
  createBookController
);

// -----------------------------------------------------------------------------
// Routes spécifiques aux formateurs
// -----------------------------------------------------------------------------

// GET /api/books/trainer/mine
// Liste les livres du formateur connecté,
// y compris les livres masqués.
router.get(
  '/trainer/mine',
  requireAuth,
  requireRole('trainer'),
  listTrainerBooksController
);

// PATCH /api/books/trainer/:id/restore
// Restaure un livre masqué.
router.patch(
  '/trainer/:id/restore',
  requireAuth,
  requireRole('trainer'),
  validateBookParams(bookIdParamsSchema),
  activateTrainerBookController
);

// DELETE /api/books/trainer/:id/permanent
// Supprime définitivement un livre.
router.delete(
  '/trainer/:id/permanent',
  requireAuth,
  requireRole('trainer'),
  validateBookParams(bookIdParamsSchema),
  deleteTrainerBookController
);

// PATCH /api/books/trainer/:id
// Modifie un livre du formateur.
router.patch(
  '/trainer/:id',
  requireAuth,
  requireRole('trainer'),
  validateBookParams(bookIdParamsSchema),
  validateBookBody(updateBookBodySchema),
  updateTrainerBookController
);

// DELETE /api/books/trainer/:id
// Masque un livre du formateur.
router.delete(
  '/trainer/:id',
  requireAuth,
  requireRole('trainer'),
  validateBookParams(bookIdParamsSchema),
  deactivateTrainerBookController
);

// -----------------------------------------------------------------------------
// Routes de téléchargement et détail
// -----------------------------------------------------------------------------

// GET /api/books/:id/download
// Télécharge un livre pour un apprenant ou un formateur.
router.get(
  '/:id/download',
  requireAuth,
  requireRole('learner', 'trainer'),
  validateBookParams(bookIdParamsSchema),
  downloadBookController
);

// GET /api/books/:id
// Affiche le détail d'un livre.
router.get(
  '/:id',
  validateBookParams(bookIdParamsSchema),
  getBookController
);

// -----------------------------------------------------------------------------
// Routes génériques
// -----------------------------------------------------------------------------

// PATCH /api/books/:id
// Modifie un livre.
router.patch(
  '/:id',
  requireAuth,
  requireRole('trainer'),
  validateBookParams(bookIdParamsSchema),
  validateBookBody(updateBookBodySchema),
  updateBookController
);

// DELETE /api/books/:id
// Désactive un livre.
router.delete(
  '/:id',
  requireAuth,
  requireRole('trainer'),
  validateBookParams(bookIdParamsSchema),
  deleteBookController
);

export default router;