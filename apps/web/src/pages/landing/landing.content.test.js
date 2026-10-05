// Tests de la landing page : liens, codes de référentiel et chiffres cohérents avec le contrat.
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { RechercheQuerySchema } from '@schoolbooks/shared';
import { MATIERES, NIVEAUX, RESSOURCES as RESSOURCES_MOCK, TYPES_DOCUMENTS } from '@schoolbooks/shared/mocks';
import { A_PROPOS, APPEL_A_L_ACTION, CHIFFRES, HERO, NOUVEAUTES, RESSOURCES } from './landing.content.js';
import { NAVIGATION, PIED_DE_PAGE } from '../../shared/layout/layout.content.js';

const codes = (liste) => liste.map((element) => element.code);
const criteres = (lien) => Object.fromEntries(new URLSearchParams(lien.split('?')[1] ?? ''));

const liensRecherche = [
  HERO.actions.principale.to,
  RESSOURCES.bouton.to,
  RESSOURCES.carteFlottante.lien.to,
  ...RESSOURCES.cartes.map((carte) => carte.to),
  A_PROPOS.bouton.to,
  NOUVEAUTES.lienTout.to,
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
  it('le hero, l’en-tête et la section utilisent le même identifiant', () => {
    expect(HERO.actions.secondaire.ancre).toBe(A_PROPOS.ancre);
    expect(NAVIGATION.find((item) => item.libelle === 'À propos').to).toBe(`/#${A_PROPOS.ancre}`);
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

  it('les chiffres sont calculés à partir des référentiels et du catalogue', async () => {
    const chiffres = await api.fetchChiffres();
    expect(chiffres).toEqual({
      niveaux: NIVEAUX.map((n) => n.libelle).join(' & '),
      ressources: String(RESSOURCES_MOCK.length),
      matieres: String(MATIERES.length),
      types: String(TYPES_DOCUMENTS.length)
    });
    expect(CHIFFRES.map((item) => item.id).sort()).toEqual(Object.keys(chiffres).sort());
  });

  it('les nouveautés renvoient au plus le nombre demandé', async () => {
    const items = await api.fetchNouveautes(NOUVEAUTES.nombre);
    expect(items.length).toBeLessThanOrEqual(NOUVEAUTES.nombre);
    expect(items.length).toBeGreaterThan(0);
  });
});
