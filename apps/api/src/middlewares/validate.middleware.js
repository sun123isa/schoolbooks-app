// =============================================================================
// Socle backend — validation des entrées avec les schémas Zod du contrat
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Usage : router.get('/', validate({ query: RechercheQuerySchema }), controller)
// Les valeurs validées (et converties : nombres, valeurs par défaut) sont
// disponibles dans req.valid.query / req.valid.params.
// Express 5 rend req.query en lecture seule : on n'écrase donc jamais req.query.
// =============================================================================
import { ERROR_CODES } from '@schoolbooks/shared';
import { HttpError } from '../utils/http-error.js';

function versDetails(issues) {
  return issues.map((issue) => ({
    champ: issue.path.join('.') || (issue.keys ? issue.keys.join(', ') : '(racine)'),
    message: issue.message
  }));
}

export function validate(schemas) {
  return (req, res, next) => {
    req.valid = req.valid || {};
    for (const [source, schema] of Object.entries(schemas)) {
      const resultat = schema.safeParse(req[source]);
      if (!resultat.success) {
        return next(
          new HttpError(
            400,
            ERROR_CODES.VALIDATION_ERROR,
            source === 'query'
              ? 'Paramètres de requête invalides'
              : source === 'body'
                ? 'Données invalides'
                : 'Paramètres invalides',
            versDetails(resultat.error.issues)
          )
        );
      }
      req.valid[source] = resultat.data;
    }
    next();
  };
}
