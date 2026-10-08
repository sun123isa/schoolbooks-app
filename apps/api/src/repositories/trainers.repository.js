import { pool } from '../config/database.js';

const trainerSelect = `
  SELECT
    t.id,
    t.first_name,
    t.last_name,
    t.email,
    t.phone,
    t.specialty,
    t.bio,
    t.status,
    t.created_at,
    t.updated_at
  FROM trainers t
`;

export async function listTrainers({ specialty, status } = {}) {
  let query = trainerSelect;
  const values = [];
  const conditions = [];
  let index = 1;

  if (specialty && specialty.trim() !== '') {
    conditions.push(`LOWER(t.specialty) = LOWER($${index})`);
    values.push(specialty.trim());
    index++;
  }

  if (status && status.trim() !== '') {
    conditions.push(`t.status = $${index}`);
    values.push(status.trim());
    index++;
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += `
    ORDER BY
      t.last_name ASC,
      t.first_name ASC
  `;

  const result = await pool.query(query, values);

  return result.rows;
}

export async function findTrainerById(id) {
  const result = await pool.query(
    `
      ${trainerSelect}
      WHERE t.id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

export async function createTrainer(data) {
  const result = await pool.query(
    `
      INSERT INTO trainers (
        first_name,
        last_name,
        email,
        phone,
        specialty,
        bio,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      data.first_name,
      data.last_name,
      data.email,
      data.phone || null,
      data.specialty,
      data.bio || null,
      data.status || 'active'
    ]
  );

  return result.rows[0];
}

export async function updateTrainer(id, data) {
  const result = await pool.query(
    `
      UPDATE trainers
      SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        specialty = COALESCE($5, specialty),
        bio = COALESCE($6, bio),
        status = COALESCE($7, status),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `,
    [
      data.first_name ?? null,
      data.last_name ?? null,
      data.email ?? null,
      data.phone ?? null,
      data.specialty ?? null,
      data.bio ?? null,
      data.status ?? null,
      id
    ]
  );

  return result.rows[0] || null;
}

export async function deactivateTrainer(id) {
  const result = await pool.query(
    `
      UPDATE trainers
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