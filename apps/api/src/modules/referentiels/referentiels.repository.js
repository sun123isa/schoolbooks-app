// =============================================================================
// Module RÉFÉRENTIELS — repository (requêtes SQL uniquement, aucune logique métier)
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Tables : levels, tracks, subjects, document_types (database/migrations/004).
// Les colonnes SQL sont en anglais (convention existante) ; le repository
// renvoie directement les noms du contrat (code, libelle, niveau, requiertAnnee).
// =============================================================================
import { pool } from '../../config/database.js';

export async function findNiveaux() {
  const { rows } = await pool.query(
    'SELECT code, label AS libelle FROM levels ORDER BY sort_order, label'
  );
  return rows;
}

// Renvoie null si le niveau n'existe pas (pour distinguer « aucun » de « inconnu »).
export async function findFilieresByNiveau(codeNiveau) {
  const niveau = await pool.query('SELECT id FROM levels WHERE code = $1', [codeNiveau]);
  if (niveau.rowCount === 0) return null;
  const { rows } = await pool.query(
    `SELECT t.code, t.label AS libelle, $1::text AS niveau
       FROM tracks t
      WHERE t.level_id = $2
      ORDER BY t.sort_order, t.label`,
    [codeNiveau, niveau.rows[0].id]
  );
  return rows;
}

export async function findMatieres() {
  const { rows } = await pool.query('SELECT code, label AS libelle FROM subjects ORDER BY label');
  return rows;
}

// Uniquement les années des ressources publiées (mêmes conditions que la recherche).
export async function findAnnees() {
  const { rows } = await pool.query(
    `SELECT DISTINCT year AS annee
       FROM books
      WHERE is_active = TRUE
        AND level_id IS NOT NULL AND subject_id IS NOT NULL AND document_type_id IS NOT NULL
        AND year IS NOT NULL
      ORDER BY year DESC`
  );
  return rows.map((row) => row.annee);
}

export async function findTypesDocuments() {
  const { rows } = await pool.query(
    'SELECT code, label AS libelle, requires_year AS "requiertAnnee" FROM document_types ORDER BY sort_order, label'
  );
  return rows;
}

// GET /api/school-levels : niveaux avec identifiant et séries/filières imbriquées
// (formulaires d'inscription et d'ajout de livre).
export async function findNiveauxScolaires() {
  const { rows } = await pool.query(
    `SELECT l.id, l.code, l.label AS libelle,
            COALESCE(
              json_agg(json_build_object('id', t.id, 'code', t.code, 'libelle', t.label) ORDER BY t.sort_order, t.label)
                FILTER (WHERE t.id IS NOT NULL),
              '[]'
            ) AS filieres
       FROM levels l
       LEFT JOIN tracks t ON t.level_id = l.id
      GROUP BY l.id
      ORDER BY l.sort_order, l.label`
  );
  return rows;
}

// GET /api/subjects : matières avec identifiant.
export async function findMatieresAvecId() {
  const { rows } = await pool.query('SELECT id, code, label AS libelle FROM subjects ORDER BY label');
  return rows;
}
