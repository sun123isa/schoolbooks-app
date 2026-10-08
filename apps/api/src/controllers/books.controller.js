import { promises as fsPromises } from 'node:fs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as booksService from '../services/books.service.js';

// -----------------------------------------------------------------------------
// Chemins
// -----------------------------------------------------------------------------

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

// Si ce fichier est dans :
// apps/api/src/controllers/books.controller.js
//
// alors le dossier cible est :
// apps/api/uploads/books
const uploadsRoot = path.resolve(
  currentDirectory,
  '../../uploads/books'
);

// Chemin absolu normalisé du dossier autorisé
const normalizedUploadsRoot =
  path.resolve(uploadsRoot) + path.sep;

// -----------------------------------------------------------------------------
// Livres publics
// -----------------------------------------------------------------------------

export async function listBooksController(
  req,
  res,
  next
) {
  try {
    const {
      level,
      subject,
      q,
      page,
      limit
    } = req.query;

    const result =
      await booksService.listBooks({
        level:
          typeof level === 'string'
            ? level.trim()
            : undefined,

        subject:
          typeof subject === 'string'
            ? subject.trim()
            : undefined,

        q:
          typeof q === 'string'
            ? q.trim()
            : undefined,

        page,
        limit
      });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookController(
  req,
  res,
  next
) {
  try {
    const book =
      await booksService.getBookById(
        req.params.id
      );

    return res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
}

// -----------------------------------------------------------------------------
// Création
// -----------------------------------------------------------------------------

export async function createBookController(
  req,
  res,
  next
) {
  try {
    if (!req.file) {
      const error = new Error(
        'Le fichier PDF est obligatoire'
      );

      error.status = 400;
      error.code = 'FILE_REQUIRED';

      throw error;
    }

    const {
      title,
      author,
      isbn,
      category,
      description,
      school_level_id,
      subject_id
    } = req.body;

    console.log('Fichier reçu :', {
      filename: req.file.filename,
      destination: req.file.destination,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  const book =
    await booksService.createBook({
      title,
      author,
      isbn,
      category,
      description,
      school_level_id,
      subject_id,

      file_name: req.file.filename,

      file_path: path
        .relative(
          process.cwd(),
          req.file.path
        )
        .replaceAll('\\', '/'),

      file_size: req.file.size,
      mime_type: req.file.mimetype,
      trainer_id: req.auth.userId
    });

    return res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
}

// -----------------------------------------------------------------------------
// Modification générique
// -----------------------------------------------------------------------------

export async function updateBookController(
  req,
  res,
  next
) {
  try {
    const book =
      await booksService.updateBook(
        req.params.id,
        req.body
      );

    return res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
}

// -----------------------------------------------------------------------------
// Suppression générique
// -----------------------------------------------------------------------------

export async function deleteBookController(
  req,
  res,
  next
) {
  try {
    const result =
      await booksService.deactivateBook(
        req.params.id
      );

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// -----------------------------------------------------------------------------
// Téléchargement
// -----------------------------------------------------------------------------

export async function downloadBookController(
  req,
  res,
  next
) {
  try {
    const book =
      await booksService.getBookById(
        req.params.id
      );

    if (!book) {
      const error = new Error(
        'Livre introuvable'
      );

      error.status = 404;
      error.code = 'BOOK_NOT_FOUND';

      throw error;
    }

    if (!book.file_path) {
      const error = new Error(
        'Chemin du fichier absent'
      );

      error.status = 404;
      error.code = 'FILE_PATH_MISSING';

      throw error;
    }

    const rawFilePath =
      String(book.file_path)
        .trim()
        .replaceAll('\\', '/');

    const fileName =
      path.basename(rawFilePath);

    const absolutePath =
      path.resolve(
        uploadsRoot,
        fileName
      );

    const normalizedUploadsRoot =
      path.resolve(uploadsRoot) +
      path.sep;

    console.log(
      'Téléchargement du livre :',
      {
        bookId: book.id,
        filePathFromDatabase: book.file_path,
        fileName,
        uploadsRoot,
        absolutePath,
        exists: fs.existsSync(
          absolutePath
        )
      }
    );

    if (
      !absolutePath.startsWith(
        normalizedUploadsRoot
      )
    ) {
      const error = new Error(
        'Chemin de fichier invalide'
      );

      error.status = 400;
      error.code = 'INVALID_FILE_PATH';

      throw error;
    }

    try {
      await fsPromises.access(
        absolutePath,
        fs.constants.R_OK
      );
    } catch {
      const error = new Error(
        'Fichier PDF introuvable'
      );

      error.status = 404;
      error.code = 'FILE_NOT_FOUND';

      throw error;
    }

    const countNumber =  await booksService.registerDownload(book.id);

    const downloadFileName = path.basename( book.file_name || fileName );

    res.setHeader(
      'Content-Type',
      book.mime_type ||
        'application/pdf'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${downloadFileName}"`
    );

    const stream =
      fs.createReadStream(absolutePath);

    stream.on('error', (streamError) => {
      if (!res.headersSent) {
        next(streamError);
      } else {
        res.destroy(streamError);
      }
    });

  
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
}
// -----------------------------------------------------------------------------
// Livres du formateur
// -----------------------------------------------------------------------------

export async function listTrainerBooksController(
  req,
  res,
  next
) {
  try {
    const books =
      await booksService.getBooksByTrainer(
        req.auth.userId
      );

    return res.json({
      success: true,
      data: {
        items: books,
        count: books.length
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTrainerBookController(
  req,
  res,
  next
) {
  try {
    const book =
      await booksService.updateTrainerBook(
        req.params.id,
        req.auth.userId,
        req.body
      );

    return res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
}

export async function deactivateTrainerBookController(
  req,
  res,
  next
) {
  try {
    const book =
      await booksService.deactivateTrainerBook(
        req.params.id,
        req.auth.userId
      );

    return res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
}

export async function activateTrainerBookController(
  req,
  res,
  next
) {
  try {
    const book =
      await booksService.activateTrainerBook(
        req.params.id,
        req.auth.userId
      );

    return res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTrainerBookController(
  req,
  res,
  next
) {
  try {
    const book =
      await booksService.deleteTrainerBook(
        req.params.id,
        req.auth.userId
      );

    return res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
}