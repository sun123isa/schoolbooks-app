// Tests — redirection après connexion (sécurité) et messages de bienvenue.
import { describe, expect, it } from 'vitest';
import { ROLES } from '@schoolbooks/shared';
import { ROUTES } from '../../app/routes.js';
import { celebrationInscription, destinationApresConnexion, estCheminInterne } from './auth.content.js';

const BARRE_INVERSE = String.fromCharCode(92);
const apprenant = { role: ROLES.apprenant, prenom: 'Awa' };
const formateur = { role: ROLES.formateur, prenom: 'Paul' };

describe('estCheminInterne (aucune redirection vers un autre site)', () => {
  it('accepte les chemins du site', () => {
    for (const chemin of ['/', '/livres/1', '/formateur/livres?filtre=inactifs', '/ressources/abc#lecture']) {
      expect(estCheminInterne(chemin), chemin).toBe(true);
    }
  });

  it('refuse les autres origines et les valeurs douteuses', () => {
    const refuses = [
      '//site-pirate.com',
      `/${BARRE_INVERSE}site-pirate.com`,
      'https://site-pirate.com',
      'javascript:alert(1)',
      `/livres${String.fromCharCode(10)}x`,
      '',
      null,
      undefined,
      42
    ];
    for (const chemin of refuses) expect(estCheminInterne(chemin), String(chemin)).toBe(false);
  });
});

describe('destinationApresConnexion', () => {
  it('ramène à la page demandée si elle est interne', () => {
    expect(destinationApresConnexion(apprenant, { depuis: '/livres/42' })).toBe('/livres/42');
  });

  it('sinon, page d’accueil du rôle', () => {
    expect(destinationApresConnexion(apprenant, { depuis: '//pirate.com' })).toBe(ROUTES.livres);
    expect(destinationApresConnexion(formateur, null)).toBe(ROUTES.tableauDeBord);
  });
});

describe('celebrationInscription', () => {
  it('formateur : invitation à publier son premier livre', () => {
    const c = celebrationInscription(formateur);
    expect(c.titre).toContain('Paul');
    expect(c.actions[0].to).toBe(ROUTES.nouveauLivre);
  });

  it('élève venu d’un document : rappelle le document, sans détour', () => {
    const c = celebrationInscription(apprenant, { titre: 'Bac C 2023' });
    expect(c.element).toBe('Bac C 2023');
    expect(c.actions).toBeUndefined();
  });

  it('élève sans document : propose le catalogue', () => {
    expect(celebrationInscription(apprenant).actions[0].to).toBe(ROUTES.livres);
  });
});
