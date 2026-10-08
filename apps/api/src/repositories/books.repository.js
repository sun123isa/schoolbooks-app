import { pool } from '../config/database.js';

const bookSelect = `
  SELECT
    b.id,
    b.title,
    b.author,
    b.isbn,
    b.category,
    b.description,
    b.file_name,
    b.file_path,
    b.file_size,
    b.mime_type,
    b.download_count,
    b.is_active,
    b.trainer_id,
    b.school_level_id,
    b.subject_id,
    b.created_at,
    b.updated_at,

    sl.name AS level,
    sl.code AS level_code,
    sl.education_cycle,

    s.name AS subject,
    s.code AS subject_code,

    CASE
      WHEN t.id IS NOT NULL
      THEN t.first_name || ' ' || t.last_name
      ELSE NULL
    END AS trainer_name
  FROM books b
  LEFT JOIN school_levels sl
    ON sl.id = b.school_level_id
  LEFT JOIN subjects s
    ON s.id = b.subject_id
  LEFT JOIN trainers t
    ON t.id = b.trainer_id
`;

export async function listBooks({
  level,
  subject,
  q,
  page = 1,
  limit = 20
} = {}) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const offset = (safePage - 1) * safeLimit;

  let where = `
    WHERE b.is_active = TRUE
  `;

  const values = [];
  let index = 1;

  if (level && level.trim() !== '') {
    where += `
      AND (
        LOWER(sl.name) = LOWER($${index})
        OR LOWER(sl.code) = LOWER($${index})
      )
    `;

    values.push(level.trim());
    index++;
  }

  if (subject && subject.trim() !== '') {
    where += `
      AND (
        LOWER(s.name) = LOWER($${index})
        OR LOWER(s.code) = LOWER($${index})
      )
    `;

    values.push(subject.trim());
    index++;
  }

  if (q && q.trim() !== '') {
    where += `
      AND (
        b.title ILIKE $${index}
        OR b.author ILIKE $${index}
        OR b.description ILIKE $${index}
        OR b.isbn ILIKE $${index}
      )
    `;

    values.push(`%${q.trim()}%`);
    index++;
  }

  const countQuery = `
    SELECT COUNT(*)::INTEGER AS total
    FROM books b
    LEFT JOIN school_levels sl
      ON sl.id = b.school_level_id
    LEFT JOIN subjects s
      ON s.id = b.subject_id
    ${where}
  `;

  const dataQuery = `
    ${bookSelect}
    ${where}
    ORDER BY
      sl.display_order ASC NULLS LAST,
      s.name ASC NULLS LAST,
      b.title ASC
    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  const countResult = await pool.query(countQuery, values);

  const dataResult = await pool.query(dataQuery, [
    ...values,
    safeLimit,
    offset
  ]);

  return {
    items: dataResult.rows,
    total: countResult.rows[0].total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(countResult.rows[0].total / safeLimit)
  };
}

export async function findBookById(id) {
  const result = await pool.query(
    `
      ${bookSelect}
      WHERE b.id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

export async function createBook(data) {
  const {
    title,
    author,
    isbn,
    category,
    description,
    school_level_id,
    subject_id,
    file_name,
    file_path,
    file_size,
    mime_type,
    trainer_id
  } = data;

  const result = await pool.query(
    `
      INSERT INTO books (
        title,
        author,
        isbn,
        category,
        description,
        school_level_id,
        subject_id,
        trainer_id,
        file_name,
        file_path,
        file_size,
        mime_type
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12
      )
      RETURNING *
    `,
    [
      title,
      author || null,
      isbn || null,
      category || null,
      description || null,
      school_level_id,
      subject_id,
      trainer_id,
      file_name,
      file_path,
      file_size || null,
      mime_type || 'application/pdf'
    ]
  );

  return result.rows[0];
}

export async function updateBook(id, data) {
  const {
    title,
    author,
    isbn,
    category,
    description,
    school_level_id,
    subject_id
  } = data;

  const result = await pool.query(
    `
      UPDATE books
      SET
        title = COALESCE($1, title),
        author = COALESCE($2, author),
        isbn = COALESCE($3, isbn),
        category = COALESCE($4, category),
        description = COALESCE($5, description),
        school_level_id = COALESCE($6, school_level_id),
        subject_id = COALESCE($7, subject_id),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `,
    [
      title ?? null,
      author ?? null,
      isbn ?? null,
      category ?? null,
      description ?? null,
      school_level_id ?? null,
      subject_id ?? null,
      id
    ]
  );

  return result.rows[0] || null;
}

export async function deactivateBook(id) {
  const result = await pool.query(
    `
      UPDATE books
      SET
        is_active = FALSE,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, is_active, updated_at
    `,
    [id]
  );

  return result.rows[0] || null;
}

export async function incrementDownloadCount(id) {
  await pool.query(
    `
      UPDATE books
      SET download_count = download_count + 1
      WHERE id = $1
    `,
    [id]
  );
}



export async function listBooksByTrainer(trainerId) {
  const result = await pool.query(
    `
      ${bookSelect}
      WHERE b.trainer_id = $1
      ORDER BY b.created_at DESC
    `,
    [trainerId]
  );

  return result.rows;
}

export async function updateTrainerBook(id, trainerId, data) {
  const {
    title,
    author,
    isbn,
    category,
    description,
    school_level_id,
    subject_id,
    is_active
  } = data;

  const result = await pool.query(
    `
      UPDATE books
      SET
        title = COALESCE($1, title),
        author = COALESCE($2, author),
        isbn = COALESCE($3, isbn),
        category = COALESCE($4, category),
        description = COALESCE($5, description),
        school_level_id = COALESCE($6, school_level_id),
        subject_id = COALESCE($7, subject_id),
        is_active = COALESCE($8, is_active),
        updated_at = NOW()
      WHERE id = $9
        AND trainer_id = $10
      RETURNING *
    `,
    [
      title ?? null,
      author ?? null,
      isbn ?? null,
      category ?? null,
      description ?? null,
      school_level_id ?? null,
      subject_id ?? null,
      is_active ?? null,
      id,
      trainerId
    ]
  );

  return result.rows[0] || null;
}

export async function deactivateTrainerBook(id, trainerId) {
  const result = await pool.query(
    `
      UPDATE books
      SET
        is_active = FALSE,
        updated_at = NOW()
      WHERE id = $1
        AND trainer_id = $2
      RETURNING id, is_active, updated_at
    `,
    [id, trainerId]
  );

  return result.rows[0] || null;
}




export async function activateTrainerBook(id, trainerId) {
  const result = await pool.query(
    `
      UPDATE books
      SET
        is_active = TRUE,
        updated_at = NOW()
      WHERE id = $1
        AND trainer_id = $2
      RETURNING id, is_active, updated_at
    `,
    [id, trainerId]
  );

  return result.rows[0] || null;
}

export async function deleteTrainerBook(id, trainerId) {
  const result = await pool.query(
    `
      DELETE FROM books
      WHERE id = $1
        AND trainer_id = $2
      RETURNING id, file_path
    `,
    [id, trainerId]
  );

  return result.rows[0] || null;
}