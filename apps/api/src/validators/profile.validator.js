import { z } from 'zod';

export const updateProfileSchema = z.object({
  first_name: z.string().min(2).max(100).optional(),
  last_name: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).optional(),
  specialty: z.string().min(2).max(100).optional(),
  bio: z.string().max(5000).optional(),
  class_group: z.string().max(50).optional()
});

export function validateProfileBody(req, res, next) {
  try {
    req.body = updateProfileSchema.parse(req.body);
    next();
  } catch (error) {
    const validationError = new Error(
      'Données de profil invalides'
    );

    validationError.status = 400;
    validationError.code = 'VALIDATION_ERROR';
    validationError.details = error.issues || error.errors;

    next(validationError);
  }
}