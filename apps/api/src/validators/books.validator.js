import { z } from 'zod';

export const bookIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createBookBodySchema = z.object({
  title: z.string().min(3).max(255),
  author: z.string().max(255).optional(),
  isbn: z.string().max(50).optional(),
  category: z.string().max(100).optional(),
  description: z.string().optional(),
  school_level_id: z.string().uuid(),
  subject_id: z.string().uuid()
});

export const updateBookBodySchema = z.object({
  title: z.string().min(3).max(255).optional(),
  author: z.string().max(255).optional(),
  isbn: z.string().max(50).optional(),
  category: z.string().max(100).optional(),
  description: z.string().optional(),
  school_level_id: z.string().uuid().optional(),
  subject_id: z.string().uuid().optional()
});

export function validateBookParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      const validationError = new Error('Identifiant de livre invalide');
      validationError.status = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = error.issues || error.errors;
      next(validationError);
    }
  };
}

export function validateBookBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      const validationError = new Error('Données du livre invalides');
      validationError.status = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = error.issues || error.errors;
      next(validationError);
    }
  };
}