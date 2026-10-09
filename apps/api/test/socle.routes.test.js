// Tests des routes — socle backend (santé, 404, format d'erreur).
// Responsables : Isaac LELO MAKAYA (code testé), Salem KONGOLO (tests des routes).
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { ApiErrorSchema, ERROR_CODES } from '@schoolbooks/shared';
import app from '../src/app.js';

describe('socle', () => {
  it('GET /api/health répond', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('une route inconnue renvoie 404 au format commun', async () => {
    const res = await request(app).get('/api/inconnue');
    expect(res.status).toBe(404);
    expect(() => ApiErrorSchema.parse(res.body)).not.toThrow();
    expect(res.body.error.code).toBe(ERROR_CODES.ROUTE_INTROUVABLE);
  });
});

describe('socle : CORS et erreurs', () => {
  it('CORS : seule l’origine CLIENT_URL est autorisée', async () => {
    const ok = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    const ko = await request(app).get('/api/health').set('Origin', 'https://pirate.example');
    expect(ko.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('erreur inattendue : 500 INTERNAL_ERROR, jamais de code système', async () => {
    const { errorMiddleware } = await import('../src/middlewares/error.middleware.js');
    const res = { headersSent: false, status: vi.fn().mockReturnThis(), json: vi.fn() };
    const err = Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' });
    errorMiddleware(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
  });
});
