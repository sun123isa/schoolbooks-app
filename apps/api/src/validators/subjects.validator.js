import { z } from 'zod';

export const subjectIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const subjectCodeParamsSchema = z.object({
  code: z.string().min(1).max(50)
});

export function validateSubjectParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      const validationError = new Error(
        'Paramètres de matière invalides'
      );

      validationError.status = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = error.issues || error.errors;

      next(validationError);
    }
  };
}