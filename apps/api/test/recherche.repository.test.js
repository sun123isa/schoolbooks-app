// Tests unitaires — construction de la requête SQL de recherche.
// Responsable : Salem KONGOLO. Le pool PostgreSQL est simulé : on vérifie le SQL
// généré et ses paramètres (requêtes paramétrées, filtres BR07, tri, pagination).
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('../src/modules/recherche/recherche.repository.js');
vi.mock('../src/config/database.js', () => ({ pool: { query: vi.fn() } }));

const { pool } = await import('../src/config/database.js');
const { rechercherRessources } = await import('../src/modules/recherche/recherche.repository.js');

const base = { page: 1, limit: 12, tri: 'pertinence' };

beforeEach(() => {
  pool.query.mockReset();
  pool.query.mockImplementation(async (sql) =>
    sql.includes('COUNT(*)') ? { rows: [{ total: 0 }] } : { rows: [] }
  );
});

const appelPage = () => pool.query.mock.calls.find(([sql]) => !sql.includes('COUNT(*)'));

describe('rechercherRessources', () => {
  it('ne renvoie que les ressources publiées', async () => {
    await rechercherRessources(base);
    const [sql] = appelPage();
    expect(sql).toContain('b.is_active = TRUE');
    expect(sql).toMatch(/JOIN levels l/);
  });

  it('BR07 : chaque filtre est une égalité paramétrée, jamais concaténée', async () => {
    await rechercherRessources({ ...base, niveau: 'lycee', filiere: 'serie-c', matiere: 'mathematiques', annee: 2023, type: 'sujet-examen' });
    const [sql, valeurs] = appelPage();
    for (const fragment of ['l.code = $1', 't.code = $2', 's.code = $3', 'b.year = $4', 'd.code = $5']) {
      expect(sql).toContain(fragment);
    }
    expect(sql).not.toContain('lycee');
    expect(valeurs).toEqual(['lycee', 'serie-c', 'mathematiques', 2023, 'sujet-examen', 12, 0]);
  });

  it('mot-clé : insensible aux accents, caractères LIKE échappés', async () => {
    await rechercherRessources({ ...base, q: '50%_x' });
    const [sql, valeurs] = appelPage();
    expect(sql).toContain('LIKE texte_normalise($1)');
    expect(valeurs[0]).toBe('%50\\%\\_x%');
  });

  it.each([
    ['titre', /ORDER BY texte_normalise\(b\.title\) ASC/],
    ['recent', /ORDER BY b\.year DESC NULLS LAST/],
    ['pertinence', /ORDER BY b\.created_at DESC/]
  ])('tri %s', async (tri, attendu) => {
    await rechercherRessources({ ...base, tri });
    expect(appelPage()[0]).toMatch(attendu);
  });

  it('pagination : LIMIT et OFFSET calculés', async () => {
    await rechercherRessources({ ...base, page: 3, limit: 5 });
    expect(appelPage()[1].slice(-2)).toEqual([5, 10]);
  });

  it('met les lignes au format du contrat', async () => {
    pool.query.mockImplementation(async (sql) =>
      sql.includes('COUNT(*)')
        ? { rows: [{ total: 1 }] }
        : {
            rows: [
              {
                id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000001', title: 'Titre', year: 2023, is_downloadable: true,
                file_path: 'ressources/x.pdf', level_code: 'lycee', level_label: 'Lycée', track_code: null,
                track_label: null, subject_code: 'svt', subject_label: 'SVT', type_code: 'cours', type_label: 'Cours'
              }
            ]
          }
    );
    const { rows, total } = await rechercherRessources(base);
    expect(total).toBe(1);
    expect(rows[0]).toEqual({
      id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000001', titre: 'Titre',
      niveau: { code: 'lycee', libelle: 'Lycée' }, filiere: null,
      matiere: { code: 'svt', libelle: 'SVT' }, type: { code: 'cours', libelle: 'Cours' },
      annee: 2023, format: 'PDF', telechargeable: true
    });
  });
});
