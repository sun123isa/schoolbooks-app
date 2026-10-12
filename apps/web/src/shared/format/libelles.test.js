// Tests du socle : mise en forme des libellés (aucun tiret cadratin affiché).
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
import { describe, expect, it } from 'vitest';
import { FILIERES, RESSOURCES } from '@schoolbooks/shared/mocks';
import { filiereComplete, filiereCourte, titreRessource } from './libelles.js';

describe('titreRessource', () => {
  it('remplace le tiret par une virgule', () => {
    expect(titreRessource('Baccalauréat série C 2023 — Mathématiques (sujet)')).toBe(
      'Baccalauréat série C 2023, Mathématiques (sujet)'
    );
    expect(titreRessource('Sans tiret')).toBe('Sans tiret');
    expect(titreRessource(null)).toBeNull();
  });

  it('aucun titre du catalogue fictif ne garde de tiret', () => {
    for (const ressource of RESSOURCES) expect(titreRessource(ressource.titre)).not.toMatch(/[—–]/);
  });
});

describe('filières', () => {
  it('version courte pour les cartes, complète pour les listes', () => {
    expect(filiereCourte('Série C — Mathématiques et sciences physiques')).toBe('Série C');
    expect(filiereComplete('Série C — Mathématiques et sciences physiques')).toBe(
      'Série C (Mathématiques et sciences physiques)'
    );
    expect(filiereCourte('Licence Droit')).toBe('Licence Droit');
    expect(filiereComplete('Licence Droit')).toBe('Licence Droit');
  });

  it('aucune filière du référentiel fictif ne garde de tiret', () => {
    for (const filiere of FILIERES) {
      expect(filiereCourte(filiere.libelle)).not.toMatch(/[—–]/);
      expect(filiereComplete(filiere.libelle)).not.toMatch(/[—–]/);
    }
  });
});
