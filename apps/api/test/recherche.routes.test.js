// Tests des routes — recherche.
// Responsable : Salem KONGOLO (code testé et tests des routes).
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { ERROR_CODES, RechercheResultatSchema, successEnvelope } from '@schoolbooks/shared';
import app from '../src/app.js';

const Reponse = successEnvelope(RechercheResultatSchema);

describe('GET /api/ressources', () => {
  it('sans critère : renvoie une page de résultats conforme', async () => {
    const res = await request(app).get('/api/ressources');
    expect(res.status).toBe(200);
    expect(() => Reponse.parse(res.body)).not.toThrow();
    expect(res.body.data.page).toBe(1);
  });

  it('BR07 : les filtres sont appliqués strictement', async () => {
    const res = await request(app).get('/api/ressources?niveau=lycee&filiere=serie-c&type=sujet-examen&annee=2023');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThan(0);
    for (const item of res.body.data.items) {
      expect(item.filiere.code).toBe('serie-c');
      expect(item.type.code).toBe('sujet-examen');
      expect(item.annee).toBe(2023);
    }
  });

  it('pagination : limit et page sont respectés', async () => {
    const res = await request(app).get('/api/ressources?limit=2&page=2');
    expect(res.body.data.items.length).toBeLessThanOrEqual(2);
    expect(res.body.data.page).toBe(2);
  });

  it('aucun résultat : 200, liste vide et message explicite', async () => {
    const res = await request(app).get('/api/ressources?q=aucune-ressource-xyz');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.message).toBeTypeOf('string');
  });

  it('paramètre invalide : 400 VALIDATION_ERROR avec détails', async () => {
    const res = await request(app).get('/api/ressources?annee=deux-mille');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(res.body.error.details[0].champ).toBe('annee');
  });

  it('BR02 : filière incompatible avec le niveau : 400 FILIERE_INCOMPATIBLE', async () => {
    const res = await request(app).get('/api/ressources?niveau=lycee&filiere=licence-droit');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.FILIERE_INCOMPATIBLE);
  });
});
