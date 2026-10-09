// Tests des routes — ressources et fichiers.
// Responsables : Emmanuel AYA (code testé), Salem KONGOLO (tests des routes).
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { ERROR_CODES, RessourceDetailSchema, successEnvelope } from '@schoolbooks/shared';
import app from '../src/app.js';
import { incrementerTelechargements } from '../src/modules/ressources/ressources.repository.js';

// Identifiants des données fictives (packages/shared/src/mocks/ressources.mock.js).
const TELECHARGEABLE = '0b6f2a4e-1c3d-4e5f-8a9b-000000000001';
const CONSULTATION_SEULE = '0b6f2a4e-1c3d-4e5f-8a9b-000000000004';
const FICHIER_MANQUANT = '0b6f2a4e-1c3d-4e5f-8a9b-000000000011';
const INCONNU = '0b6f2a4e-1c3d-4e5f-8a9b-999999999999';

// Les documents sont réservés aux comptes connectés : un apprenant inscrit une fois.
let agentApprenant;
async function apprenant() {
  if (!agentApprenant) {
    agentApprenant = request.agent(app);
    await agentApprenant
      .post('/api/auth/register/learner')
      .send({ prenom: 'Jean', nom: 'Test', email: 'apprenant@test.cg', motDePasse: 'motdepasse1', niveau: 'lycee' });
  }
  return agentApprenant;
}

describe('accès aux documents', () => {
  it('lecture et téléchargement sans session : 401 NON_AUTHENTIFIE', async () => {
    for (const route of ['fichier', 'telechargement']) {
      const res = await request(app).get(`/api/ressources/${TELECHARGEABLE}/${route}`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ERROR_CODES.NON_AUTHENTIFIE);
    }
  });
});

describe('GET /api/ressources/:id', () => {
  it('renvoie le détail conforme au contrat', async () => {
    const res = await request(app).get(`/api/ressources/${TELECHARGEABLE}`);
    expect(res.status).toBe(200);
    expect(() => successEnvelope(RessourceDetailSchema).parse(res.body)).not.toThrow();
  });

  it('id inconnu : 404 RESSOURCE_INTROUVABLE', async () => {
    const res = await request(app).get(`/api/ressources/${INCONNU}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.RESSOURCE_INTROUVABLE);
  });

  it('id mal formé : 400 VALIDATION_ERROR', async () => {
    const res = await request(app).get('/api/ressources/pas-un-uuid');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});

describe('GET /api/ressources/:id/fichier', () => {
  it('sert le PDF en ligne', async () => {
    const res = await (await apprenant()).get(`/api/ressources/${CONSULTATION_SEULE}/fichier`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toMatch(/^inline/);
  });

  it('BR06 : fichier absent : 404 FICHIER_INDISPONIBLE', async () => {
    const res = await (await apprenant()).get(`/api/ressources/${FICHIER_MANQUANT}/fichier`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.FICHIER_INDISPONIBLE);
  });
});

describe('GET /api/ressources/:id/telechargement', () => {
  it('sert le PDF en pièce jointe si téléchargeable', async () => {
    const res = await (await apprenant()).get(`/api/ressources/${TELECHARGEABLE}/telechargement`);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/^attachment/);
  });

  it('BR08 : non téléchargeable : 403 TELECHARGEMENT_NON_AUTORISE', async () => {
    const res = await (await apprenant()).get(`/api/ressources/${CONSULTATION_SEULE}/telechargement`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.TELECHARGEMENT_NON_AUTORISE);
  });
});

describe('protection des fichiers et compteur', () => {
  it('BR10 : le détail ne contient aucun chemin de fichier', async () => {
    const res = await request(app).get(`/api/ressources/${TELECHARGEABLE}`);
    expect(JSON.stringify(res.body)).not.toMatch(/file_path|\.pdf|storage/);
  });

  it('BR06 : ressource sans fichier : disponible = false, aucune URL', async () => {
    const res = await request(app).get(`/api/ressources/${FICHIER_MANQUANT}`);
    expect(res.body.data.disponible).toBe(false);
    expect(res.body.data.urls).toEqual({ fichier: null, telechargement: null });
  });

  it('en-têtes no-store et nosniff sur les fichiers', async () => {
    const res = await (await apprenant()).get(`/api/ressources/${CONSULTATION_SEULE}/fichier`);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('un téléchargement réussi incrémente le compteur', async () => {
    incrementerTelechargements.mockClear();
    await (await apprenant()).get(`/api/ressources/${TELECHARGEABLE}/telechargement`);
    await vi.waitFor(() => expect(incrementerTelechargements).toHaveBeenCalledWith(TELECHARGEABLE));
  });

  it('un téléchargement refusé ne l’incrémente pas', async () => {
    incrementerTelechargements.mockClear();
    await (await apprenant()).get(`/api/ressources/${CONSULTATION_SEULE}/telechargement`);
    expect(incrementerTelechargements).not.toHaveBeenCalled();
  });
});
