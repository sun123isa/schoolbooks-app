// Tests du socle frontend : construction des liens entre pages et des URL d'API.
// Responsables : HIRWA Jean Baptiste (code testé), Salem KONGOLO (relecture).
import { describe, expect, it } from 'vitest';
import { cheminRecherche, cheminRessource, cheminRetourRecherche } from './routes.js';
import { buildUrl, resolveApiUrl } from '../shared/api/client.js';

describe('liens entre pages', () => {
  it('landing → recherche avec critères pré-remplis', () => {
    expect(cheminRecherche({ niveau: 'lycee', filiere: 'serie-c' })).toBe('/recherche?niveau=lycee&filiere=serie-c');
    expect(cheminRecherche({ niveau: 'lycee', filiere: undefined })).toBe('/recherche?niveau=lycee');
    expect(cheminRecherche()).toBe('/recherche');
  });

  it('recherche → fiche → retour aux mêmes résultats', () => {
    expect(cheminRessource('abc')).toBe('/ressources/abc');
    expect(cheminRetourRecherche({ retour: '?niveau=lycee' })).toBe('/recherche?niveau=lycee');
    expect(cheminRetourRecherche(null)).toBe('/recherche');
    expect(cheminRetourRecherche({ retour: 'https://exemple.com' })).toBe('/recherche');
  });
});

describe('client API', () => {
  it('ignore les paramètres vides', () => {
    expect(buildUrl('/ressources', { q: ' maths ', niveau: '', page: 2 })).toBe('/api/ressources?q=maths&page=2');
  });

  it('résout les chemins renvoyés par l’API', () => {
    expect(resolveApiUrl('/api/ressources/x/fichier')).toBe('/api/ressources/x/fichier');
    expect(resolveApiUrl(null)).toBeNull();
  });
});
