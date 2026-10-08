import { pool } from '../config/database.js';

export async function updateLearnerProfile(id, data) {
  const result = await pool.query(
    `
      UPDATE learners
      SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        class_group = COALESCE($4, class_group),
        updated_at = NOW()
      WHERE id = $5
      RETURNING
        id,
        first_name,
        last_name,
        email,
        phone,
        birth_date,
        school_level_id,
        class_group,
        status,
        'learner' AS account_type
    `,
    [
      data.first_name ?? null,
      data.last_name ?? null,
      data.phone ?? null,
      data.class_group ?? null,
      id
    ]
  );

  return result.rows[0] || null;
}

export async function updateTrainerProfile(id, data) {
  const result = await pool.query(
    `
      UPDATE trainers
      SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        specialty = COALESCE($4, specialty),
        bio = COALESCE($5, bio),
        updated_at = NOW()
      WHERE id = $6
      RETURNING
        id,
        first_name,
        last_name,
        email,
        phone,
        specialty,
        bio,
        status,
        'trainer' AS account_type
    `,
    [
      data.first_name ?? null,
      data.last_name ?? null,
      data.phone ?? null,
      data.specialty ?? null,
      data.bio ?? null,
      id
    ]
  );

  return result.rows[0] || null;
}