import { z } from 'zod';

export const trainerIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createTrainerBodySchema = z.object({
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional(),
  specialty: z.string().min(2).max(100),
  bio: z.string().optional(),
  status: z
    .enum(['active', 'inactive', 'suspended'])
    .optional()
});

export const updateTrainerBodySchema =
  createTrainerBodySchema.partial();

export function validateTrainerParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      const validationError = new Error(
        'Paramètres formateur invalides'
      );

      validationError.status = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = error.issues || error.errors;

      next(validationError);
    }
  };
}

export function validateTrainerBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      const validationError = new Error(
        'Données formateur invalides'
      );

      validationError.status = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = error.issues || error.errors;

      next(validationError);
    }
  };
}