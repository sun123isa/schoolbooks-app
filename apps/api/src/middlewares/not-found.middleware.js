// =============================================================================
// Socle backend — route inconnue
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Placé après toutes les routes et avant errorMiddleware : renvoie un 404 au
// format d'erreur commun au lieu de la page HTML par défaut d'Express.
// =============================================================================
import { ERROR_CODES } from '@schoolbooks/shared';
import { HttpError } from '../utils/http-error.js';

export function notFoundMiddleware(req, res, next) {
  next(new HttpError(404, ERROR_CODES.ROUTE_INTROUVABLE, `Route introuvable : ${req.method} ${req.path}`));
}
