// =============================================================================
// Socle backend — erreur HTTP métier
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Périmètre : toute erreur volontaire de l'API est levée avec HttpError, puis
// mise en forme par error.middleware.js selon ApiErrorSchema (@schoolbooks/shared).
// Exemple : throw new HttpError(404, ERROR_CODES.RESSOURCE_INTROUVABLE, 'Ressource introuvable');
// =============================================================================

export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
