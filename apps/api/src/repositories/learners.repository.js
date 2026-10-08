import { pool } from '../config/database.js';

const learnerSelect = `
  SELECT
    l.id,
    l.first_name,
    l.last_name,
    l.email,
    l.phone,
    l.birth_date,
    l.school_level_id,
    l.class_group,
    l.status,
    l.created_at,
    l.updated_at,

    sl.name AS level,
    sl.code AS level_code,
    sl.education_cycle

  FROM learners l
  INNER JOIN school_levels sl
    ON sl.id = l.school_level_id
`;

export async function listLearners() {
  const result = await pool.query(`
    ${learnerSelect}
    ORDER BY
      sl.display_order ASC,
      l.last_name ASC,
      l.first_name ASC
  `);

  return result.rows;
}

export async function findLearnerById(id) {
  const result = await pool.query(
    `
      ${learnerSelect}
      WHERE l.id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

export async function createLearner(data) {
  const result = await pool.query(
    `
      INSERT INTO learners (
        first_name,
        last_name,
        email,
        phone,
        birth_date,
        school_level_id,
        class_group,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      data.first_name,
      data.last_name,
      data.email,
      data.phone || null,
      data.birth_date || null,
      data.school_level_id,
      data.class_group || null,
      data.status || 'active'
    ]
  );

  return result.rows[0];
}

export async function updateLearner(id, data) {
  const result = await pool.query(
    `
      UPDATE learners
      SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        birth_date = COALESCE($5, birth_date),
        school_level_id = COALESCE($6, school_level_id),
        class_group = COALESCE($7, class_group),
        status = COALESCE($8, status),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `,
    [
      data.first_name ?? null,
      data.last_name ?? null,
      data.email ?? null,
      data.phone ?? null,
      data.birth_date ?? null,
      data.school_level_id ?? null,
      data.class_group ?? null,
      data.status ?? null,
      id
    ]
  );

  return result.rows[0] || null;
}

export async function deactivateLearner(id) {
  const result = await pool.query(
    `
      UPDATE learners
      SET
        status = 'inactive',
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return result.rows[0] || null;
}