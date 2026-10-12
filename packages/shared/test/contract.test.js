// Tests du contrat : les données fictives respectent les schémas partagés.
// Responsable : Salem KONGOLO (Lead Reviewer).
import { describe, expect, it } from 'vitest';
import {
  AnneesSchema,
  FilieresSchema,
  MatieresSchema,
  NiveauxSchema,
  RechercheQuerySchema,
  RechercheResultatSchema,
  RessourceDetailSchema,
  TypesDocumentsSchema
} from '../src/index.js';
import {
  FILIERES,
  MATIERES,
  NIVEAUX,
  RESSOURCES,
  TYPES_DOCUMENTS,
  listerAnneesMock,
  listerFilieresMock,
  rechercherRessourcesMock
} from '../src/mocks/index.js';

describe('référentiels fictifs', () => {
  it('respectent les schémas', () => {
    expect(() => NiveauxSchema.parse(NIVEAUX)).not.toThrow();
    expect(() => FilieresSchema.parse(FILIERES)).not.toThrow();
    expect(() => MatieresSchema.parse(MATIERES)).not.toThrow();
    expect(() => TypesDocumentsSchema.parse(TYPES_DOCUMENTS)).not.toThrow();
    expect(() => AnneesSchema.parse(listerAnneesMock())).not.toThrow();
  });

  it('BR02 : chaque filière appartient à un niveau existant', () => {
    for (const filiere of FILIERES) {
      expect(NIVEAUX.map((n) => n.code)).toContain(filiere.niveau);
    }
    expect(listerFilieresMock('inconnu')).toBeNull();
  });
});

describe('ressources fictives', () => {
  it('respectent le schéma de détail', () => {
    for (const ressource of RESSOURCES) {
      expect(() => RessourceDetailSchema.parse(ressource)).not.toThrow();
    }
  });

  it('BR02, BR04, BR08 : règles métier respectées', () => {
    for (const ressource of RESSOURCES) {
      const type = TYPES_DOCUMENTS.find((t) => t.code === ressource.type.code);
      if (type.requiertAnnee) expect(ressource.annee).not.toBeNull();
      if (ressource.filiere) {
        const filiere = FILIERES.find((f) => f.code === ressource.filiere.code);
        expect(filiere.niveau).toBe(ressource.niveau.code);
      }
      if (!ressource.telechargeable) expect(ressource.urls.telechargement).toBeNull();
    }
  });
});

describe('recherche', () => {
  it('applique strictement les filtres (BR07)', () => {
    const query = RechercheQuerySchema.parse({ niveau: 'lycee', type: 'sujet-examen', annee: '2023' });
    const resultat = rechercherRessourcesMock(query);
    expect(() => RechercheResultatSchema.parse(resultat)).not.toThrow();
    expect(resultat.total).toBeGreaterThan(0);
    for (const item of resultat.items) {
      expect(item.niveau.code).toBe('lycee');
      expect(item.type.code).toBe('sujet-examen');
      expect(item.annee).toBe(2023);
    }
  });

  it('renvoie un message explicite sans résultat', () => {
    const resultat = rechercherRessourcesMock(RechercheQuerySchema.parse({ q: 'introuvable-xyz' }));
    expect(resultat.total).toBe(0);
    expect(resultat.message).toBeTypeOf('string');
  });

  it('refuse les paramètres inconnus ou invalides', () => {
    expect(RechercheQuerySchema.safeParse({ niveua: 'lycee' }).success).toBe(false);
    expect(RechercheQuerySchema.safeParse({ annee: 'abc' }).success).toBe(false);
    expect(RechercheQuerySchema.safeParse({ limit: '500' }).success).toBe(false);
  });

  it('ignore les paramètres vides venant de l’URL', () => {
    const query = RechercheQuerySchema.parse({ niveau: '', q: '' });
    expect(query.niveau).toBeUndefined();
    expect(query.page).toBe(1);
  });
});

describe('mocks des livres et des formulaires', () => {
  it('le catalogue fictif respecte ListeLivresSchema', async () => {
    const { ListeLivresSchema } = await import('../src/index.js');
    const { listerLivresMock } = await import('../src/mocks/index.js');
    expect(() => ListeLivresSchema.parse(listerLivresMock({ page: 2, limit: 6 }))).not.toThrow();
  });

  it('chaque niveau scolaire porte ses filières (BR02)', async () => {
    const { NIVEAUX_SCOLAIRES, listerFilieresMock } = await import('../src/mocks/index.js');
    for (const niveau of NIVEAUX_SCOLAIRES) {
      expect(niveau.filieres.map((f) => f.code)).toEqual(listerFilieresMock(niveau.code).map((f) => f.code));
    }
  });
});
