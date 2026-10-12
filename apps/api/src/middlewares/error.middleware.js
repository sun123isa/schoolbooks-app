// Responsable : Isaac LELO MAKAYA (socle backend) — relecture : Salem KONGOLO
// Format de sortie : ApiErrorSchema (@schoolbooks/shared).
// Middleware centralisé pour gérer les erreurs dans toute l'API.
// Il évite de répéter try/catch + res.status dans chaque contrôleur.
import { ERROR_CODES } from '@schoolbooks/shared';
import { env } from '../config/env.js';

export function errorMiddleware(err, req, res, next) {
  // Si l'erreur a déjà un statut HTTP, on l'utilise.
  const status = err.status || err.statusCode || 500;
  const inattendue = status >= 500;

  // Les erreurs inattendues sont journalisées (sauf pendant les tests automatisés).
  if (env.nodeEnv !== 'test' && inattendue) {
    console.error('Erreur API:', err);
  }

  // Une réponse a déjà commencé (flux de fichier interrompu) : on ne peut plus
  // envoyer de JSON, Express se charge de couper la connexion.
  if (res.headersSent) {
    return next(err);
  }

  let code = err.code || ERROR_CODES.INTERNAL_ERROR;
  let message = err.message || 'Erreur interne du serveur';

  if (err.type === 'entity.parse.failed') {
    // Corps JSON mal formé (express.json).
    code = ERROR_CODES.VALIDATION_ERROR;
    message = 'Corps de requête JSON invalide';
  } else if (inattendue) {
    // Jamais de code système (ENOENT, ECONNREFUSED...) ni de détail technique
    // côté client ; en production, le message est générique.
    code = ERROR_CODES.INTERNAL_ERROR;
    if (env.nodeEnv === 'production') message = 'Erreur interne du serveur';
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      // Détails de validation ({ champ, message }[]) quand ils existent.
      ...(Array.isArray(err.details) ? { details: err.details } : {})
    }
  });
}
