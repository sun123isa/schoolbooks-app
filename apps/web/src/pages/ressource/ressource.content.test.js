// Tests de la page de consultation : formatage, fiche, règle de téléchargement (BR08), zoom.
// Responsable : Karene MOUSSOUNDA — relecture : Salem KONGOLO
import { describe, expect, it } from 'vitest';
import { RESSOURCES } from '@schoolbooks/shared/mocks';
import {
  ZOOM_MAX,
  ZOOM_MIN,
  formaterDate,
  formaterTaille,
  informations,
  peutTelecharger,
  zoomSuivant
} from './ressource.content.js';

const trouver = (fragment) => RESSOURCES.find((r) => r.titre.includes(fragment));

describe('formaterTaille', () => {
  it('choisit une unité lisible', () => {
    expect(formaterTaille(512)).toBe('512 o');
    expect(formaterTaille(412_000)).toBe('402 Ko');
    expect(formaterTaille(7_340_032)).toBe('7,0 Mo');
    expect(formaterTaille(null)).toBeNull();
  });
});

describe('formaterDate', () => {
  it('affiche la date en toutes lettres et ignore les valeurs invalides', () => {
    expect(formaterDate('2026-09-01T08:00:00.000Z')).toBe('1 septembre 2026');
    expect(formaterDate('pas une date')).toBeNull();
    expect(formaterDate(null)).toBeNull();
  });
});

describe('informations', () => {
  it('omet les valeurs absentes (ressource sans filière ni année)', () => {
    const ressource = trouver('Méthodologie de la dissertation');
    const ids = informations(ressource).map((ligne) => ligne.id);
    expect(ids).not.toContain('annee');
    expect(informations(ressource).find((ligne) => ligne.id === 'filiere').valeur).toBe('Toutes séries');
  });

  it('les 11 ressources fictives produisent une fiche avec niveau, matière et type', () => {
    for (const ressource of RESSOURCES) {
      const ids = informations(ressource).map((ligne) => ligne.id);
      expect(ids).toEqual(expect.arrayContaining(['niveau', 'matiere', 'type', 'format']));
    }
  });
});

describe('peutTelecharger (BR08)', () => {
  it('refuse une ressource non téléchargeable (Philosophie 2024)', () => {
    expect(peutTelecharger(trouver('Philosophie'))).toBe(false);
  });

  it('accepte une ressource téléchargeable, sauf si le PDF est en erreur', () => {
    const ressource = trouver('Mathématiques (sujet)');
    expect(peutTelecharger(ressource)).toBe(true);
    expect(peutTelecharger(ressource, true)).toBe(false);
  });

  it('refuse une ressource dont le fichier est absent (BR06)', () => {
    const sansFichier = RESSOURCES.find((r) => !r.disponible);
    expect(sansFichier).toBeDefined();
    expect(peutTelecharger(sansFichier)).toBe(false);
  });
});

describe('zoomSuivant', () => {
  it('avance par paliers et reste borné', () => {
    expect(zoomSuivant(1, 1)).toBe(1.25);
    expect(zoomSuivant(1, -1)).toBe(0.8);
    expect(zoomSuivant(ZOOM_MAX, 1)).toBe(ZOOM_MAX);
    expect(zoomSuivant(ZOOM_MIN, -1)).toBe(ZOOM_MIN);
  });
});

// -----------------------------------------------------------------------------
// Note : Karene MOUSSOUNDA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
