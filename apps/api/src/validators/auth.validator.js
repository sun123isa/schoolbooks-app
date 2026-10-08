import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Le mot de passe est trop long');

export const registerLearnerSchema = z.object({
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: passwordSchema,
  phone: z.string().max(30).optional(),
  birth_date: z.string().date().optional(),
  school_level_id: z.string().uuid(),
  class_group: z.string().max(50).optional()
});

export const registerTrainerSchema = z.object({
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: passwordSchema,
  phone: z.string().max(30).optional(),
  specialty: z.string().min(2).max(100),
  bio: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: passwordSchema
});

export function validateAuthBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      const validationError = new Error(
        'Données d’authentification invalides'
      );

      validationError.status = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = error.issues || error.errors;

      next(validationError);
    }
  };
}