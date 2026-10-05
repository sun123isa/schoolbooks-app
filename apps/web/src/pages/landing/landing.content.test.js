// Tests de la landing page : liens, codes de référentiel et données cohérents avec le contrat.
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { RechercheQuerySchema } from '@schoolbooks/shared';
import { NIVEAUX, RESSOURCES as RESSOURCES_MOCK, TYPES_DOCUMENTS } from '@schoolbooks/shared/mocks';
import { A_PROPOS, APPEL_A_L_ACTION, HERO, NOUVEAUTES, RESSOURCES, attribuerImages, cheminNouveautes } from './landing.content.js';
import { NAVIGATION, PIED_DE_PAGE } from '../../shared/layout/layout.content.js';

const codes = (liste) => liste.map((element) => element.code);
const criteres = (lien) => Object.fromEntries(new URLSearchParams(lien.split('?')[1] ?? ''));

const liensRecherche = [
  HERO.actions.principale.to,
  RESSOURCES.bouton.to,
  RESSOURCES.carteFlottante.lien.to,
  ...RESSOURCES.cartes.map((carte) => carte.to),
  A_PROPOS.bouton.to,
  ...NOUVEAUTES.filtres.map((filtre) => cheminNouveautes(filtre.code)),
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

describe('nouveautés', () => {
  it('des photos pour chaque type de document', () => {
    for (const code of codes(TYPES_DOCUMENTS)) expect(NOUVEAUTES.images[code]?.length).toBeGreaterThan(0);
  });

  it('pas de photo en double parmi les ressources affichées', () => {
    const sujets = RESSOURCES_MOCK.filter((r) => r.type.code === 'sujet-examen').slice(0, NOUVEAUTES.nombre);
    expect(sujets).toHaveLength(NOUVEAUTES.nombre);
    const images = attribuerImages(sujets);
    expect(new Set(images).size).toBe(images.length);
  });

  it('les filtres utilisent des niveaux existants', () => {
    for (const filtre of NOUVEAUTES.filtres.filter((f) => f.code)) expect(codes(NIVEAUX)).toContain(filtre.code);
  });
});

describe('données de la page (mode mock)', () => {
  // Le client API lit VITE_USE_MOCKS au chargement : on l'active avant d'importer.
  let api;
  beforeAll(async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'true');
    vi.resetModules();
    api = await import('./landing.api.js');
  });

  it('les nouveautés renvoient au plus le nombre demandé', async () => {
    const items = await api.fetchNouveautes(NOUVEAUTES.nombre, '');
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(NOUVEAUTES.nombre);
  });

  it('le filtre par niveau est appliqué strictement (BR07)', async () => {
    const items = await api.fetchNouveautes(NOUVEAUTES.nombre, 'universite');
    expect(items.length).toBeGreaterThan(0);
    for (const ressource of items) expect(ressource.niveau.code).toBe('universite');
  });
});
