import { pool } from '../config/database.js';

// Récupère les matières.
export async function findAllSubjects({ activeOnly = true } = {}) {
  let query = `
    SELECT
      id,
      name,
      code,
      description,
      is_active,
      created_at,
      updated_at
    FROM subjects
  `;

  if (activeOnly) {
    query += ' WHERE is_active = TRUE';
  }

  query += ' ORDER BY name ASC';

  const result = await pool.query(query);

  return result.rows;
}

// Récupère une matière par son UUID.
export async function findSubjectById(id) {
  const query = `
    SELECT
      id,
      name,
      code,
      description,
      is_active,
      created_at,
      updated_at
    FROM subjects
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
}

// Récupère une matière par son code.
export async function findSubjectByCode(code) {
  const query = `
    SELECT
      id,
      name,
      code,
      description,
      is_active,
      created_at,
      updated_at
    FROM subjects
    WHERE code = $1
  `;

  const result = await pool.query(query, [code]);

  return result.rows[0] || null;
}