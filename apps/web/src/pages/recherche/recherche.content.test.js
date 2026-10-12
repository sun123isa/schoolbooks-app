// Tests de la page de recherche : libellés, critères actifs, pagination.
// Responsable : Graciel MBEMBA — relecture : Salem KONGOLO
import { describe, expect, it } from 'vitest';
import { FILIERES, MATIERES, NIVEAUX, TYPES_DOCUMENTS } from '@schoolbooks/shared/mocks';
import { TRIS as TRIS_CONTRAT } from '@schoolbooks/shared';
import { TRIS, criteresActifs, libelleTotal, pagesAffichees } from './recherche.content.js';

describe('libelleTotal', () => {
  it('accorde au singulier et au pluriel', () => {
    expect(libelleTotal(0)).toBe('0 ressource trouvée');
    expect(libelleTotal(1)).toBe('1 ressource trouvée');
    expect(libelleTotal(12)).toBe('12 ressources trouvées');
  });
});

describe('criteresActifs', () => {
  const referentiels = { niveaux: NIVEAUX, filieres: FILIERES, matieres: MATIERES, types: TYPES_DOCUMENTS };

  it('affiche les libellés des référentiels, dans un ordre stable', () => {
    const actifs = criteresActifs(
      { type: 'corrige', niveau: 'lycee', q: 'maths', filiere: 'serie-c', annee: '2023', page: '2', tri: 'recent' },
      referentiels
    );
    expect(actifs).toEqual([
      { cle: 'q', libelle: '« maths »' },
      { cle: 'niveau', libelle: 'Lycée' },
      { cle: 'filiere', libelle: 'Série C' },
      { cle: 'annee', libelle: '2023' },
      { cle: 'type', libelle: "Corrigé d'examen" }
    ]);
  });

  it('ignore la page et le tri, et retombe sur le code si le libellé est inconnu', () => {
    expect(criteresActifs({ matiere: 'inconnue', page: '3' }, referentiels)).toEqual([{ cle: 'matiere', libelle: 'inconnue' }]);
    expect(criteresActifs({})).toEqual([]);
  });
});

describe('pagesAffichees', () => {
  it('liste toutes les pages quand il y en a peu', () => {
    expect(pagesAffichees(1, 1)).toEqual([1]);
    expect(pagesAffichees(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('résume les longues paginations autour de la page courante', () => {
    expect(pagesAffichees(6, 12)).toEqual([1, '…', 5, 6, 7, '…', 12]);
    expect(pagesAffichees(1, 12)).toEqual([1, 2, 3, 4, '…', 12]);
    expect(pagesAffichees(12, 12)).toEqual([1, '…', 9, 10, 11, 12]);
  });
});

describe('tris', () => {
  it('proposent exactement les tris acceptés par l’API', () => {
    expect(TRIS.map((tri) => tri.code)).toEqual(TRIS_CONTRAT);
  });
});

// -----------------------------------------------------------------------------
// Note : Graciel MBEMBA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
