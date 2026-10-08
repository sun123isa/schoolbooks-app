import { z } from 'zod';

export const learnerIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createLearnerBodySchema = z.object({
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional(),
  birth_date: z.string().date().optional(),
  school_level_id: z.string().uuid(),
  class_group: z.string().max(50).optional(),
  status: z
    .enum(['active', 'inactive', 'suspended'])
    .optional()
});

export const updateLearnerBodySchema =
  createLearnerBodySchema.partial();

export function validateLearnerParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      const validationError = new Error(
        'Paramètres apprenant invalides'
      );

      validationError.status = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = error.issues || error.errors;

      next(validationError);
    }
  };
}

export function validateLearnerBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      const validationError = new Error(
        'Données apprenant invalides'
      );

      validationError.status = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = error.issues || error.errors;

      next(validationError);
    }
  };
}