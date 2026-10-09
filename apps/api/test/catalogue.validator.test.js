// Tests unitaires — validation d'une ressource avant intégration au catalogue.
// Responsables : Emmanuel AYA (code testé), Salem KONGOLO (tests).
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { ERROR_CODES } from '@schoolbooks/shared';
import { validerRessourceCatalogue } from '../src/modules/ressources/catalogue.validator.js';
import { findDoublon } from '../src/modules/ressources/ressources.repository.js';
import { fichierLisible, resoudreChemin } from '../src/modules/ressources/storage.js';

const dossier = path.dirname(fileURLToPath(import.meta.url));
const PDF = path.join(dossier, 'fixtures/storage/ressources/exemple.pdf');

const valide = {
  titre: 'Baccalauréat série C 2019 — Mathématiques (sujet)',
  niveau: 'lycee',
  filiere: 'serie-c',
  matiere: 'mathematiques',
  type: 'sujet-examen',
  annee: 2019,
  droits: 'Document officiel — diffusion libre.',
  fichier: PDF
};

const erreur = (promesse) => promesse.then(() => null, (e) => e);

describe('validerRessourceCatalogue', () => {
  it('accepte une ressource complète et calcule empreinte et taille', async () => {
    const r = await validerRessourceCatalogue(valide);
    expect(r.empreinte).toMatch(/^[0-9a-f]{64}$/);
    expect(r.tailleOctets).toBeGreaterThan(0);
    expect(r.telechargeable).toBe(false); // BR10 : interdit par défaut
  });

  it('BR04 : sujet d’examen sans année → 422 RESSOURCE_INCOMPLETE', async () => {
    const e = await erreur(validerRessourceCatalogue({ ...valide, annee: undefined }));
    expect(e.status).toBe(422);
    expect(e.code).toBe(ERROR_CODES.RESSOURCE_INCOMPLETE);
    expect(e.details.map((d) => d.champ)).toContain('annee');
  });

  it('BR01/BR03/BR05/BR10 : codes inconnus et droits absents → 422', async () => {
    const e = await erreur(validerRessourceCatalogue({ ...valide, matiere: 'astrologie', droits: undefined }));
    expect(e.code).toBe(ERROR_CODES.RESSOURCE_INCOMPLETE);
    expect(e.details.map((d) => d.champ)).toContain('droits');
    const e2 = await erreur(validerRessourceCatalogue({ ...valide, matiere: 'astrologie' }));
    expect(e2.details.map((d) => d.champ)).toContain('matiere');
  });

  it('BR06 : fichier absent ou non PDF → 422', async () => {
    const e = await erreur(validerRessourceCatalogue({ ...valide, fichier: path.join(dossier, 'setup/base-fictive.js') }));
    expect(e.details.map((d) => d.champ)).toContain('fichier');
  });

  it('BR02 : filière hors niveau → 400 FILIERE_INCOMPATIBLE', async () => {
    const e = await erreur(validerRessourceCatalogue({ ...valide, filiere: 'licence-droit' }));
    expect(e.code).toBe(ERROR_CODES.FILIERE_INCOMPATIBLE);
  });

  it('BR09 : doublon → 409 DOUBLON', async () => {
    findDoublon.mockResolvedValueOnce({ id: 'x', title: 'Déjà là' });
    const e = await erreur(validerRessourceCatalogue(valide));
    expect(e.status).toBe(409);
    expect(e.code).toBe(ERROR_CODES.DOUBLON);
  });
});

describe('stockage', () => {
  it('refuse toute sortie du dossier de stockage', async () => {
    expect(() => resoudreChemin('../../package.json')).toThrow();
    expect(await fichierLisible('../../package.json')).toBe(false);
  });

  it('BR06 : seul un PDF existant est lisible', async () => {
    expect(await fichierLisible('ressources/exemple.pdf')).toBe(true);
    expect(await fichierLisible('ressources/manquant.pdf')).toBe(false);
    expect(await fichierLisible(null)).toBe(false);
  });
});
