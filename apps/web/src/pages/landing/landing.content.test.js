// Tests de la landing page : liens et codes de référentiel cohérents avec le contrat.
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
import { describe, expect, it } from 'vitest';
import { MATIERES, NIVEAUX, TYPES_DOCUMENTS } from '@schoolbooks/shared/mocks';
import { APPEL_A_L_ACTION, ATOUTS, ETAPES, HERO, cheminRechercheMotCle } from './landing.content.js';
import { PIED_DE_PAGE } from '../../shared/layout/layout.content.js';

const codes = (liste) => liste.map((element) => element.code);

describe('recherche depuis le hero', () => {
  it('place le mot-clé dans l’URL de recherche', () => {
    expect(cheminRechercheMotCle('  Maths Terminale C ')).toBe('/recherche?q=Maths+Terminale+C');
  });

  it('une saisie vide mène à la recherche sans critère', () => {
    expect(cheminRechercheMotCle('   ')).toBe('/recherche');
    expect(cheminRechercheMotCle(null)).toBe('/recherche');
  });
});

describe('codes de référentiel (contrat partagé)', () => {
  it('les tendances utilisent des matières existantes', () => {
    for (const tendance of HERO.recherche.tendances) {
      expect(codes(MATIERES)).toContain(tendance.criteres.matiere);
    }
  });

  it('les pastilles de niveau utilisent des niveaux existants', () => {
    const pastilles = ETAPES.liste[0].pastilles;
    expect(pastilles).toHaveLength(3);
    for (const pastille of pastilles) {
      expect(codes(NIVEAUX)).toContain(pastille.criteres.niveau);
    }
  });

  it('les liens filtrés par type utilisent des types existants', () => {
    const liens = [...ATOUTS.cartes.map((c) => c.lien.to), ...PIED_DE_PAGE.colonnes.flatMap((c) => c.liens.map((l) => l.to))];
    for (const lien of liens.filter((to) => to?.includes('type='))) {
      const type = new URLSearchParams(lien.split('?')[1]).get('type');
      expect(codes(TYPES_DOCUMENTS)).toContain(type);
    }
  });
});

describe('appels à l’action', () => {
  it('mènent tous à la page de recherche', () => {
    const liens = [
      HERO.actions.trouver.to,
      HERO.actions.catalogue.to,
      APPEL_A_L_ACTION.bouton.to,
      ...ATOUTS.cartes.map((carte) => carte.lien.to)
    ];
    for (const lien of liens) expect(lien.startsWith('/recherche')).toBe(true);
  });
});
