// Tests des routes — référentiels.
// Responsables : Isaac LELO MAKAYA (code testé), Salem KONGOLO (tests des routes).
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import {
  AnneesSchema,
  ERROR_CODES,
  FilieresSchema,
  MatieresSchema,
  NiveauxSchema,
  TypesDocumentsSchema,
  successEnvelope
} from '@schoolbooks/shared';
import app from '../src/app.js';

describe('référentiels', () => {
  it.each([
    ['/api/niveaux', NiveauxSchema],
    ['/api/niveaux/lycee/filieres', FilieresSchema],
    ['/api/matieres', MatieresSchema],
    ['/api/annees', AnneesSchema],
    ['/api/types-documents', TypesDocumentsSchema]
  ])('GET %s respecte le contrat', async (url, schema) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(200);
    expect(() => successEnvelope(schema).parse(res.body)).not.toThrow();
  });

  it('BR02 : seules les filières du niveau sont renvoyées', async () => {
    const res = await request(app).get('/api/niveaux/universite/filieres');
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const filiere of res.body.data) expect(filiere.niveau).toBe('universite');
  });

  it('niveau inconnu : 404 NIVEAU_INTROUVABLE', async () => {
    const res = await request(app).get('/api/niveaux/maternelle/filieres');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.NIVEAU_INTROUVABLE);
  });
});
