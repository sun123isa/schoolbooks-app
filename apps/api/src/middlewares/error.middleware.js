import multer from 'multer';

export function errorMiddleware(err, req, res, next) {
  // Affiche l'erreur complète dans le terminal pendant le développement.
  console.error('Erreur API:', err);

  // Si les en-têtes ont déjà été envoyés, Express doit terminer le traitement.
  if (res.headersSent) {
    return next(err);
  }

  // Gestion des erreurs liées à Multer.
  if (err instanceof multer.MulterError) {
    // Le fichier dépasse la taille maximale autorisée.
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Le fichier dépasse la taille maximale autorisée.',
          code: 'FILE_TOO_LARGE'
        }
      });
    }

    // Autre erreur d'upload générée par Multer.
    return res.status(400).json({
      success: false,
      error: {
        message: "Erreur lors de l'upload du fichier.",
        code: err.code || 'UPLOAD_ERROR'
      }
    });
  }

  // Erreur générée par notre filtre de fichiers.
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Seuls les fichiers PDF sont autorisés.',
        code: 'INVALID_FILE_TYPE'
      }
    });
  }

  // Violation d'une contrainte UNIQUE PostgreSQL.
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: {
        message: 'Une donnée identique existe déjà.',
        code: 'DUPLICATE_RESOURCE'
      }
    });
  }

  // Violation d'une clé étrangère PostgreSQL.
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'La référence vers une ressource inexistante est interdite.',
        code: 'INVALID_REFERENCE'
      }
    });
  }

  // Erreur PostgreSQL de valeur invalide.
  if (err.code === '22P02') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Une valeur envoyée est invalide.',
        code: 'INVALID_VALUE'
      }
    });
  }

  // Statut HTTP personnalisé ou erreur serveur par défaut.
  const status = err.status || err.statusCode || 500;

  // Ne pas exposer les détails techniques en production.
  const message =
    status >= 500
      ? 'Une erreur interne est survenue.'
      : err.message || 'Une erreur est survenue.';

  const response = {
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR'
    }
  };

  // Les détails sont utiles pour les erreurs de validation.
  if (err.details) {
    response.error.details = err.details;
  }

  res.status(status).json(response);
}