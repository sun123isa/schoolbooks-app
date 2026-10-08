import { pool } from '../config/database.js';

// Récupère tous les niveaux scolaires.
export async function findAllSchoolLevels({ activeOnly = true } = {}) {
  let query = `
    SELECT
      id,
      name,
      code,
      education_cycle,
      display_order,
      is_active,
      created_at,
      updated_at
    FROM school_levels
  `;

  const values = [];

  // Par défaut, on retourne uniquement les niveaux actifs.
  if (activeOnly) {
    query += ' WHERE is_active = TRUE';
  }

  // L'ordre permet d'afficher CE1, CE2, CM1, etc. dans le bon sens.
  query += ' ORDER BY display_order ASC';

  const result = await pool.query(query, values);

  return result.rows;
}

// Récupère un niveau par son UUID.
export async function findSchoolLevelById(id) {
  const query = `
    SELECT
      id,
      name,
      code,
      education_cycle,
      display_order,
      is_active,
      created_at,
      updated_at
    FROM school_levels
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
}

// Récupère un niveau par son code.
export async function findSchoolLevelByCode(code) {
  const query = `
    SELECT
      id,
      name,
      code,
      education_cycle,
      display_order,
      is_active,
      created_at,
      updated_at
    FROM school_levels
    WHERE code = $1
  `;

  const result = await pool.query(query, [code]);

  return result.rows[0] || null;
}