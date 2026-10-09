// =============================================================================
// Contrat d'API — format d'erreur commun et codes d'erreur
// Responsable : Isaac LELO MAKAYA (socle backend) — relecture : Salem KONGOLO
// Périmètre : toutes les réponses en erreur de l'API respectent ApiErrorSchema.
// Le frontend s'appuie sur `error.code` (jamais sur le message) pour choisir
// le message à afficher.
// =============================================================================
import { z } from 'zod';

export const ERROR_CODES = {
  // Socle (Isaac)
  VALIDATION_ERROR: 'VALIDATION_ERROR', // 400 — paramètres ou corps invalides
  ROUTE_INTROUVABLE: 'ROUTE_INTROUVABLE', // 404 — route inconnue
  INTERNAL_ERROR: 'INTERNAL_ERROR', // 500 — erreur inattendue

  // Référentiels (Isaac)
  NIVEAU_INTROUVABLE: 'NIVEAU_INTROUVABLE', // 404 — code de niveau inconnu
  FILIERE_INCOMPATIBLE: 'FILIERE_INCOMPATIBLE', // 400 — BR02 : filière hors du niveau

  // Ressources et fichiers (Emmanuel)
  RESSOURCE_INTROUVABLE: 'RESSOURCE_INTROUVABLE', // 404 — id inconnu ou ressource retirée
  FICHIER_INDISPONIBLE: 'FICHIER_INDISPONIBLE', // 404 — BR06 : PDF absent ou illisible
  TELECHARGEMENT_NON_AUTORISE: 'TELECHARGEMENT_NON_AUTORISE', // 403 — BR08

  // Intégration au catalogue (Emmanuel)
  RESSOURCE_INCOMPLETE: 'RESSOURCE_INCOMPLETE', // 422 — BR01/BR03/BR05/BR04
  DOUBLON: 'DOUBLON', // 409 — BR09

  // Comptes et authentification
  NON_AUTHENTIFIE: 'NON_AUTHENTIFIE', // 401 — access token absent, invalide ou expiré
  SESSION_EXPIREE: 'SESSION_EXPIREE', // 401 — refresh token absent, révoqué ou expiré
  IDENTIFIANTS_INVALIDES: 'IDENTIFIANTS_INVALIDES', // 401 — e-mail ou mot de passe incorrect
  ACCES_INTERDIT: 'ACCES_INTERDIT', // 403 — rôle insuffisant ou livre d'un autre formateur
  EMAIL_DEJA_UTILISE: 'EMAIL_DEJA_UTILISE', // 409 — inscription avec un e-mail existant
  TROP_DE_REQUETES: 'TROP_DE_REQUETES', // 429 — trop de tentatives de connexion

  // Livres des formateurs
  LIVRE_INTROUVABLE: 'LIVRE_INTROUVABLE', // 404 — id inconnu (ou livre désactivé pour le public)
  REFERENTIEL_INCONNU: 'REFERENTIEL_INCONNU', // 400 — niveau, matière, filière ou type inconnu
  FICHIER_REQUIS: 'FICHIER_REQUIS', // 400 — création sans PDF
  FICHIER_INVALIDE: 'FICHIER_INVALIDE', // 400 — fichier qui n'est pas un PDF
  FICHIER_TROP_VOLUMINEUX: 'FICHIER_TROP_VOLUMINEUX' // 413 — au-delà de la taille maximale
};

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    // Détails de validation (liste des champs en erreur), optionnels.
    details: z
      .array(
        z.object({
          champ: z.string(),
          message: z.string()
        })
      )
      .optional()
  })
});

// Enveloppe de succès commune : { success: true, data: ... }.
export function successEnvelope(dataSchema) {
  return z.object({
    success: z.literal(true),
    data: dataSchema
  });
}
