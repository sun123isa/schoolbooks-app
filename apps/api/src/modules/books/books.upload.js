// =============================================================================
// Module BOOKS — réception du PDF (multipart/form-data, champ « fichier »)
// Le fichier est gardé en mémoire (25 Mo maximum) : il n'est écrit sur disque
// qu'après validation complète (signature PDF, doublon, référentiels).
// =============================================================================
import multer from 'multer';
import { ERROR_CODES, TAILLE_MAX_PDF } from '@schoolbooks/shared';
import { HttpError } from '../../utils/http-error.js';

export const CHAMP_FICHIER = 'fichier';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAILLE_MAX_PDF, files: 1, fields: 20 },
  fileFilter: (req, file, cb) => {
    // Premier contrôle sur le type déclaré ; la signature %PDF- est vérifiée ensuite.
    if (file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname)) return cb(null, true);
    cb(new HttpError(400, ERROR_CODES.FICHIER_INVALIDE, 'Seuls les fichiers PDF sont acceptés.'));
  }
});

const recevoir = upload.single(CHAMP_FICHIER);

// Traduit les erreurs de multer dans le format d'erreur commun.
export function recevoirPdf(req, res, next) {
  recevoir(req, res, (err) => {
    if (!err) return next();
    if (err instanceof HttpError) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        new HttpError(413, ERROR_CODES.FICHIER_TROP_VOLUMINEUX, `Le PDF dépasse la taille maximale de ${TAILLE_MAX_PDF / 1024 / 1024} Mo.`)
      );
    }
    next(new HttpError(400, ERROR_CODES.VALIDATION_ERROR, `Envoi du fichier invalide (${err.message}).`));
  });
}
