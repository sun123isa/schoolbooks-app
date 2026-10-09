// =============================================================================
// Socle backend — limitation de débit en mémoire (par IP, fenêtre fixe)
// Suffisant pour une instance unique ; avec plusieurs instances, utiliser un
// stockage partagé (Redis). Désactivée pendant les tests automatisés.
// =============================================================================
import { ERROR_CODES } from '@schoolbooks/shared';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

export function limiterDebit({ fenetreMs, max }) {
  const compteurs = new Map();

  return (req, res, next) => {
    if (env.nodeEnv === 'test') return next();
    const maintenant = Date.now();
    const cle = req.ip;
    let entree = compteurs.get(cle);
    if (!entree || entree.fin <= maintenant) {
      entree = { nombre: 0, fin: maintenant + fenetreMs };
      compteurs.set(cle, entree);
    }
    entree.nombre += 1;

    // Ménage des fenêtres terminées pour borner la mémoire.
    if (compteurs.size > 10_000) {
      for (const [ip, e] of compteurs) if (e.fin <= maintenant) compteurs.delete(ip);
    }

    if (entree.nombre > max) {
      res.set('Retry-After', String(Math.ceil((entree.fin - maintenant) / 1000)));
      return next(new HttpError(429, ERROR_CODES.TROP_DE_REQUETES, 'Trop de tentatives. Réessayez dans quelques minutes.'));
    }
    next();
  };
}
