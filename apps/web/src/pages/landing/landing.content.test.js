// Tests de la landing page : liens, codes de référentiel et données cohérents avec le contrat.
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
import { describe, expect, it } from 'vitest';
import { RechercheQuerySchema } from '@schoolbooks/shared';
import { NIVEAUX, TYPES_DOCUMENTS } from '@schoolbooks/shared/mocks';
import { A_PROPOS, APPEL_A_L_ACTION, FORMATEURS, HERO, RESSOURCES } from './landing.content.js';
import { ROUTES } from '../../app/routes.js';
import { NAVIGATION, PIED_DE_PAGE } from '../../shared/layout/layout.content.js';

const codes = (liste) => liste.map((element) => element.code);
const criteres = (lien) => Object.fromEntries(new URLSearchParams(lien.split('?')[1] ?? ''));

const liensRecherche = [
  HERO.actions.principale.to,
  RESSOURCES.bouton.to,
  RESSOURCES.carteFlottante.lien.to,
  ...RESSOURCES.cartes.map((carte) => carte.to),
  A_PROPOS.bouton.to,
  APPEL_A_L_ACTION.bouton.to,
  ...NAVIGATION.map((item) => item.to),
  ...PIED_DE_PAGE.colonnes.flatMap((colonne) => colonne.liens.map((lien) => lien.to))
].filter((lien) => lien?.startsWith('/recherche'));

describe('liens vers la recherche (contrat partagé)', () => {
  it('chaque lien produit des critères acceptés par l’API (BR07)', () => {
    expect(liensRecherche.length).toBeGreaterThan(10);
    for (const lien of liensRecherche) {
      expect(RechercheQuerySchema.safeParse(criteres(lien)).success, lien).toBe(true);
    }
  });

  it('les codes de type et de niveau existent dans les référentiels', () => {
    for (const lien of liensRecherche) {
      const { type, niveau } = criteres(lien);
      if (type) expect(codes(TYPES_DOCUMENTS)).toContain(type);
      if (niveau) expect(codes(NIVEAUX)).toContain(niveau);
    }
  });

  it('une carte par type de document du contrat', () => {
    expect(RESSOURCES.cartes.map((carte) => carte.type).sort()).toEqual(codes(TYPES_DOCUMENTS).sort());
  });
});

describe('ancre « À propos »', () => {
  it('le hero et le pied de page mènent à la section ; elle n’est plus dans la barre', () => {
    expect(HERO.actions.secondaire.ancre).toBe(A_PROPOS.ancre);
    const liensPied = PIED_DE_PAGE.colonnes.flatMap((colonne) => colonne.liens);
    expect(liensPied.find((lien) => lien.libelle === 'À propos').to).toBe(`/#${A_PROPOS.ancre}`);
    expect(NAVIGATION.some((item) => item.libelle === 'À propos')).toBe(false);
  });
});

describe('section « Pour les formateurs »', () => {
  it('mène à l’inscription et à la connexion des formateurs', () => {
    expect(FORMATEURS.boutons.principal.to).toBe(`${ROUTES.inscription}?role=formateur`);
    expect(FORMATEURS.boutons.secondaire.to).toBe(`${ROUTES.connexion}?role=formateur`);
  });

  it('trois étapes illustrées, sept jours dans le visuel', () => {
    expect(FORMATEURS.etapes).toHaveLength(3);
    for (const etape of FORMATEURS.etapes) expect(['compte', 'publier', 'suivre']).toContain(etape.icone);
    expect(FORMATEURS.visuel.jours).toHaveLength(7);
  });

  it('la photo a un texte alternatif', () => {
    expect(FORMATEURS.image.alt.length).toBeGreaterThan(10);
  });
});
