import { z } from 'zod';

// Vérifie que le paramètre :id est un UUID valide.
export const schoolLevelIdParamsSchema = z.object({
  id: z.string().uuid()
});

// Vérifie que le paramètre :code est une chaîne non vide.
export const schoolLevelCodeParamsSchema = z.object({
  code: z.string().min(1).max(30)
});

// Middleware générique de validation des paramètres URL.
export function validateSchoolLevelParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      const validationError = new Error(
        'Paramètres du niveau scolaire invalides'
      );

      validationError.status = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = error.issues || error.errors;

      next(validationError);
    }
  };
}