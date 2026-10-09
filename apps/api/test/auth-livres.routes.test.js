// Tests des routes — comptes (auth) et livres des formateurs.
// Les repositories auth et books sont remplacés par des versions en mémoire ;
// services, middlewares (cookies, rôles), contrôleurs et stockage sont les vrais.
// Les PDF envoyés sont écrits sous test/fixtures/storage/uploads (nettoyé à la fin).
import fs from 'fs/promises';
import path from 'path';
import request from 'supertest';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

// Le hachage scrypt des mots de passe est volontairement coûteux.
vi.setConfig({ testTimeout: 30_000 });
import {
  ERROR_CODES,
  ListeLivresSchema,
  LivreDetailSchema,
  MesLivresSchema,
  TAILLE_MAX_PDF,
  UtilisateurSchema,
  successEnvelope
} from '@schoolbooks/shared';

// Réponse conforme au contrat partagé (lève une erreur détaillée sinon).
const conforme = (schema, res) => successEnvelope(schema).parse(res.body);
import app from '../src/app.js';
import { env } from '../src/config/env.js';

vi.mock('../src/modules/books/books.repository.js', async () => {
  const { findCompte } = await import('../src/modules/auth/auth.repository.js');
  const livres = [];
  const REF = {
    niveaux: { lycee: { id: 1, label: 'Lycée', filieres: { 'serie-c': 2 } } },
    matieres: { mathematiques: { id: 1, label: 'Mathématiques' }, philosophie: { id: 2, label: 'Philosophie' } },
    types: { livre: { id: 1, label: 'Livre', requires_year: false }, 'sujet-examen': { id: 2, label: "Sujet d'examen", requires_year: true } }
  };
  const code = (table, id) => Object.entries(REF[table]).find(([, v]) => v.id === id);
  async function versLigne(l) {
    const [levelCode, niveau] = code('niveaux', l.level_id);
    const [subjectCode, matiere] = code('matieres', l.subject_id);
    const [typeCode, type] = code('types', l.document_type_id);
    const trackCode = Object.entries(niveau.filieres).find(([, id]) => id === l.track_id)?.[0] ?? null;
    const formateur = await findCompte('trainer', l.trainer_id);
    return {
      ...l,
      level_code: levelCode, level_label: niveau.label,
      track_code: trackCode, track_label: trackCode ? 'Série C' : null,
      subject_code: subjectCode, subject_label: matiere.label,
      type_code: typeCode, type_label: type.label,
      trainer_first_name: formateur?.first_name, trainer_last_name: formateur?.last_name
    };
  }
  const COLONNES = { titre: 'title', auteur: 'author', description: 'description', levelId: 'level_id', trackId: 'track_id', subjectId: 'subject_id', typeId: 'document_type_id', annee: 'year', telechargeable: 'is_downloadable', droits: 'usage_rights', nomFichier: 'file_name', cheminFichier: 'file_path', tailleOctets: 'file_size', empreinte: 'file_checksum' };
  const versColonnes = (m) => Object.fromEntries(Object.entries(m).filter(([k, v]) => COLONNES[k] && v !== undefined).map(([k, v]) => [COLONNES[k], v]));

  return {
    listerLivresPublies: async ({ q, niveau, matiere, page, limit }) => {
      const lignes = await Promise.all(livres.filter((l) => l.is_active).map(versLigne));
      const filtres = lignes.filter(
        (l) => (!niveau || l.level_code === niveau) && (!matiere || l.subject_code === matiere) && (!q || l.title.toLowerCase().includes(q.toLowerCase()))
      );
      return { lignes: filtres.slice((page - 1) * limit, page * limit), total: filtres.length };
    },
    findLivre: async (id) => {
      const l = livres.find((x) => x.id === id);
      return l ? versLigne(l) : null;
    },
    findLivreParFichier: async (chemin) => livres.find((l) => l.file_path === chemin) ?? null,
    listerLivresFormateur: async (trainerId) => Promise.all(livres.filter((l) => l.trainer_id === trainerId).map(versLigne)),
    statistiquesFormateur: async (trainerId) => {
      const siens = livres.filter((l) => l.trainer_id === trainerId);
      return {
        livres: siens.length,
        telechargements: siens.reduce((s, l) => s + l.download_count, 0),
        actifs: siens.filter((l) => l.is_active).length,
        matieres: new Set(siens.map((l) => l.subject_id)).size
      };
    },
    resoudreReferentiels: async ({ niveau, matiere, type, filiere }) => {
      const n = REF.niveaux[niveau], m = REF.matieres[matiere], t = REF.types[type];
      if (!n || !m || !t) return null;
      return { level_id: n.id, level_label: n.label, subject_id: m.id, subject_label: m.label, type_id: t.id, type_label: t.label, requires_year: t.requires_year, track_id: n.filieres[filiere] ?? null };
    },
    creerLivre: async (d) => {
      const maintenant = new Date();
      const l = { id: crypto.randomUUID(), download_count: 0, is_active: true, deactivated_at: null, trainer_id: d.trainerId, created_at: maintenant, updated_at: maintenant, ...versColonnes(d) };
      livres.push(l);
      return l.id;
    },
    modifierLivre: async (id, m) => Object.assign(livres.find((l) => l.id === id), versColonnes(m), { updated_at: new Date() }),
    changerActivation: async (id, actif) => Object.assign(livres.find((l) => l.id === id), { is_active: actif, deactivated_at: actif ? null : new Date() }),
    supprimerLivre: async (id) => livres.splice(livres.findIndex((l) => l.id === id), 1),
    incrementerTelechargements: async (id) => {
      livres.find((l) => l.id === id).download_count += 1;
    },
    findParEmpreinte: async (empreinte, saufId) => livres.find((l) => l.file_checksum === empreinte && l.id !== saufId) ?? null,
    findDoublonMetadonnees: async ({ titre, levelId, subjectId, typeId, annee }, saufId) =>
      livres.find(
        (l) =>
          l.id !== saufId &&
          l.title.toLowerCase() === titre.toLowerCase() &&
          l.level_id === levelId &&
          l.subject_id === subjectId &&
          l.document_type_id === typeId &&
          (l.year ?? null) === (annee ?? null)
      ) ?? null
  };
});

afterAll(async () => {
  await fs.rm(path.join(env.storageDir, 'uploads'), { recursive: true, force: true });
});

const PDF = Buffer.from('%PDF-1.4\n% test\n');
const pdfUnique = () => Buffer.concat([PDF, Buffer.from(`% ${crypto.randomUUID()}\n`)]);
const MDP = 'motdepasse1';

async function inscrire(role, extra = {}) {
  const agent = request.agent(app);
  const corps =
    role === 'trainer'
      ? { prenom: 'Ada', nom: 'Lovelace', email: `${crypto.randomUUID()}@test.cg`, motDePasse: MDP, specialite: 'Mathématiques', ...extra }
      : { prenom: 'Jean', nom: 'Élève', email: `${crypto.randomUUID()}@test.cg`, motDePasse: MDP, niveau: 'lycee', ...extra };
  const res = await agent.post(`/api/auth/register/${role}`).send(corps);
  return { agent, res, corps };
}

function publier(agent, champs = {}, fichier = pdfUnique()) {
  let req = agent.post('/api/books');
  for (const [cle, valeur] of Object.entries({ titre: 'Algèbre linéaire', niveau: 'lycee', matiere: 'mathematiques', ...champs })) {
    req = req.field(cle, String(valeur));
  }
  return fichier ? req.attach('fichier', fichier, { filename: 'livre.pdf', contentType: 'application/pdf' }) : req;
}

describe('Authentification', () => {
  it('inscrit un apprenant et pose les cookies HTTP-only', async () => {
    const { res } = await inscrire('learner');
    expect(res.status).toBe(201);
    expect(res.body.data.utilisateur).toMatchObject({ role: 'learner', niveau: 'lycee' });
    conforme(z.object({ utilisateur: UtilisateurSchema }), res);
    const cookies = res.headers['set-cookie'].join(';');
    expect(cookies).toMatch(/sb_access=.*HttpOnly/);
    expect(cookies).toMatch(/sb_refresh=.*Path=\/api\/auth.*HttpOnly/);
    expect(JSON.stringify(res.body)).not.toMatch(/eyJ/); // aucun jeton dans le corps
  });

  it('inscrit un formateur', async () => {
    const { res } = await inscrire('trainer');
    expect(res.status).toBe(201);
    expect(res.body.data.utilisateur).toMatchObject({ role: 'trainer', specialite: 'Mathématiques' });
  });

  it('refuse un e-mail déjà utilisé (409), quelle que soit la casse', async () => {
    const { corps } = await inscrire('learner');
    const res = await request(app).post('/api/auth/register/trainer').send({ ...corps, email: corps.email.toUpperCase(), specialite: 'SVT', niveau: undefined });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe(ERROR_CODES.EMAIL_DEJA_UTILISE);
  });

  it('refuse un mot de passe faible et un niveau inconnu', async () => {
    let res = await request(app).post('/api/auth/register/learner').send({ prenom: 'A', nom: 'B', email: 'a@b.cg', motDePasse: 'court', niveau: 'lycee' });
    expect(res.status).toBe(400);
    expect(res.body.error.details.some((d) => d.champ === 'motDePasse')).toBe(true);
    res = await request(app).post('/api/auth/register/learner').send({ prenom: 'A', nom: 'B', email: 'c@b.cg', motDePasse: MDP, niveau: 'maternelle' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.REFERENTIEL_INCONNU);
  });

  it('connexion, /me, refresh avec rotation, déconnexion', async () => {
    const { corps } = await inscrire('learner');
    const agent = request.agent(app);

    let res = await agent.post('/api/auth/login').send({ email: corps.email, motDePasse: 'mauvais1' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.IDENTIFIANTS_INVALIDES);

    res = await agent.post('/api/auth/login').send({ email: corps.email, motDePasse: MDP });
    expect(res.status).toBe(200);
    const ancienRefresh = res.headers['set-cookie'].find((c) => c.startsWith('sb_refresh=')).split(';')[0];

    res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.data.utilisateur.email).toBe(corps.email);

    res = await agent.post('/api/auth/refresh');
    expect(res.status).toBe(200);

    // Le refresh token déjà utilisé est refusé (rotation).
    res = await request(app).post('/api/auth/refresh').set('Cookie', ancienRefresh);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.SESSION_EXPIREE);

    res = await agent.post('/api/auth/logout');
    expect(res.status).toBe(200);
    res = await agent.get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.NON_AUTHENTIFIE);
  });

  it('/me sans session : 401 ; jeton falsifié : 401', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    const res = await request(app).get('/api/auth/me').set('Cookie', 'sb_access=abc.def.ghi');
    expect(res.status).toBe(401);
  });
});

describe('Référentiels des livres', () => {
  it('GET /api/school-levels et /api/subjects', async () => {
    const niveaux = await request(app).get('/api/school-levels');
    expect(niveaux.status).toBe(200);
    expect(niveaux.body.data[0]).toHaveProperty('filieres');
    const matieres = await request(app).get('/api/subjects');
    expect(matieres.status).toBe(200);
    expect(matieres.body.data[0]).toHaveProperty('id');
  });
});

describe('Livres — rôles et permissions', () => {
  it('création : 401 sans session, 403 pour un apprenant', async () => {
    expect((await publier(request(app))).status).toBe(401);
    const { agent } = await inscrire('learner');
    const res = await publier(agent);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.ACCES_INTERDIT);
  });

  it('création : PDF obligatoire, signature PDF, doublon, filière, année', async () => {
    const { agent } = await inscrire('trainer');
    expect((await publier(agent, {}, null)).body.error.code).toBe(ERROR_CODES.FICHIER_REQUIS);
    expect((await publier(agent, {}, Buffer.from('pas un pdf'))).body.error.code).toBe(ERROR_CODES.FICHIER_INVALIDE);
    expect((await publier(agent, { filiere: 'licence-droit' })).body.error.code).toBe(ERROR_CODES.FILIERE_INCOMPATIBLE);
    expect((await publier(agent, { type: 'sujet-examen' })).status).toBe(422);
    const fichier = pdfUnique();
    expect((await publier(agent, {}, fichier)).status).toBe(201);
    // BR09 : même fichier, ou même titre / niveau / matière / type / année.
    expect((await publier(agent, { titre: 'Autre titre' }, fichier)).body.error.code).toBe(ERROR_CODES.DOUBLON);
    const memeTitre = await publier(agent, { titre: 'ALGÈBRE linéaire' });
    expect(memeTitre.status).toBe(409);
    expect(memeTitre.body.error.code).toBe(ERROR_CODES.DOUBLON);
  });

  it('création : référentiel inconnu (400) et PDF trop volumineux (413)', async () => {
    const { agent } = await inscrire('trainer');
    const inconnu = await publier(agent, { titre: 'Astronomie', matiere: 'astrologie' });
    expect(inconnu.status).toBe(400);
    expect(inconnu.body.error.code).toBe(ERROR_CODES.REFERENTIEL_INCONNU);
    const gros = Buffer.concat([Buffer.from('%PDF-1.4 '), Buffer.alloc(TAILLE_MAX_PDF)]);
    const tropGros = await publier(agent, { titre: 'Trop volumineux' }, gros);
    expect(tropGros.status).toBe(413);
    expect(tropGros.body.error.code).toBe(ERROR_CODES.FICHIER_TROP_VOLUMINEUX);
  });
});

describe('Livres — parcours complet', () => {
  it('publie, liste, lit, télécharge, modifie, désactive, restaure et supprime', async () => {
    const formateur = await inscrire('trainer');
    const autre = await inscrire('trainer');
    const apprenant = await inscrire('learner');

    let res = await publier(formateur.agent, { titre: 'Géométrie Terminale C', filiere: 'serie-c', telechargeable: 'true' });
    expect(res.status).toBe(201);
    conforme(LivreDetailSchema, res);
    const livre = res.body.data;
    expect(livre).toMatchObject({ actif: true, estProprietaire: true, disponible: true });
    expect(livre.urls.fichier).toMatch(/^\/api\/uploads\/books\/[0-9a-f-]{36}\.pdf$/);
    expect(JSON.stringify(livre)).not.toMatch(/uploads\/books\/.*uploads|storage/);

    // Catalogue : mot-clé, filtres, pagination.
    res = await request(app).get('/api/books').query({ q: 'géométrie', niveau: 'lycee', matiere: 'mathematiques', limit: 5 });
    conforme(ListeLivresSchema, res);
    expect(res.body.data.items.map((l) => l.id)).toContain(livre.id);
    expect(res.body.data).toMatchObject({ page: 1, limit: 5 });
    res = await request(app).get('/api/books').query({ matiere: 'philosophie' });
    expect(res.body.data.items.map((l) => l.id)).not.toContain(livre.id);

    // Lecture dans le navigateur : réservée aux comptes connectés.
    expect((await request(app).get(livre.urls.fichier)).status).toBe(401);
    res = await apprenant.agent.get(livre.urls.fichier);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/^inline/);

    // Téléchargement : connexion requise, compteur incrémenté.
    expect((await request(app).get(livre.urls.telechargement)).status).toBe(401);
    res = await apprenant.agent.get(livre.urls.telechargement);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/^attachment/);
    await new Promise((r) => setTimeout(r, 20));
    expect((await request(app).get(`/api/books/${livre.id}`)).body.data.telechargements).toBe(1);

    // Modification : seul le propriétaire.
    expect((await autre.agent.patch(`/api/books/trainer/${livre.id}`).send({ titre: 'Piratage' })).status).toBe(403);
    res = await formateur.agent.patch(`/api/books/trainer/${livre.id}`).send({ titre: 'Géométrie — v2', telechargeable: false });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ titre: 'Géométrie — v2', telechargeable: false });
    expect((await apprenant.agent.get(livre.urls.telechargement)).body.error.code).toBe(ERROR_CODES.TELECHARGEMENT_NON_AUTORISE);

    // Remplacement du PDF : l'ancien fichier disparaît.
    res = await formateur.agent
      .patch(`/api/books/trainer/${livre.id}`)
      .attach('fichier', pdfUnique(), { filename: 'v2.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(200);
    expect(res.body.data.urls.fichier).not.toBe(livre.urls.fichier);
    expect((await apprenant.agent.get(livre.urls.fichier)).status).toBe(404);
    const urlFichier = res.body.data.urls.fichier;

    // Tableau de bord.
    res = await formateur.agent.get('/api/books/trainer/mine');
    conforme(MesLivresSchema, res);
    expect(res.body.data.statistiques).toEqual({ livres: 1, telechargements: 1, actifs: 1, matieres: 1 });
    expect((await apprenant.agent.get('/api/books/trainer/mine')).status).toBe(403);

    // Désactivation : invisible pour le public, visible pour le propriétaire.
    res = await formateur.agent.delete(`/api/books/trainer/${livre.id}`);
    expect(res.body.data.actif).toBe(false);
    expect((await request(app).get(`/api/books/${livre.id}`)).status).toBe(404);
    expect((await apprenant.agent.get(urlFichier)).status).toBe(404);
    expect((await formateur.agent.get(urlFichier)).status).toBe(200);
    expect((await formateur.agent.get(`/api/books/${livre.id}`)).status).toBe(200);
    expect((await formateur.agent.get('/api/books/trainer/mine')).body.data.statistiques.actifs).toBe(0);

    // Restauration.
    res = await formateur.agent.patch(`/api/books/trainer/${livre.id}/restore`);
    expect(res.body.data.actif).toBe(true);
    expect((await request(app).get(`/api/books/${livre.id}`)).status).toBe(200);

    // Suppression définitive : propriétaire uniquement, fichier effacé.
    expect((await autre.agent.delete(`/api/books/trainer/${livre.id}/permanent`)).status).toBe(403);
    expect((await formateur.agent.delete(`/api/books/trainer/${livre.id}/permanent`)).status).toBe(200);
    expect((await formateur.agent.get(`/api/books/${livre.id}`)).body.error.code).toBe(ERROR_CODES.LIVRE_INTROUVABLE);
    expect((await formateur.agent.get(urlFichier)).status).toBe(404);
  });

  it('refuse un nom de fichier forgé (traversée de répertoire)', async () => {
    const res = await request(app).get('/api/uploads/books/..%2F..%2F.env');
    expect(res.status).toBe(400);
  });
});
