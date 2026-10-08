import { pool } from '../config/database.js';

export async function findAccountByEmail(email) {
  const result = await pool.query(
    `
      SELECT
        id,
        first_name,
        last_name,
        email,
        password_hash,
        status,
        'learner' AS account_type,
        school_level_id
      FROM learners
      WHERE LOWER(email) = LOWER($1)

      UNION ALL

      SELECT
        id,
        first_name,
        last_name,
        email,
        password_hash,
        status,
        'trainer' AS account_type,
        NULL::UUID AS school_level_id
      FROM trainers
      WHERE LOWER(email) = LOWER($1)

      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

export async function createLearnerAccount(data) {
  const result = await pool.query(
    `
      INSERT INTO learners (
        first_name,
        last_name,
        email,
        password_hash,
        school_level_id,
        class_group,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'active')
      RETURNING
        id,
        first_name,
        last_name,
        email,
        school_level_id,
        class_group,
        status
    `,
    [
      data.first_name,
      data.last_name,
      data.email,
      data.password_hash,
      data.school_level_id,
      data.class_group || null
    ]
  );

  return {
    ...result.rows[0],
    account_type: 'learner'
  };
}

export async function createTrainerAccount(data) {
  const result = await pool.query(
    `
      INSERT INTO trainers (
        first_name,
        last_name,
        email,
        password_hash,
        phone,
        specialty,
        bio,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
      RETURNING
        id,
        first_name,
        last_name,
        email,
        phone,
        specialty,
        bio,
        status
    `,
    [
      data.first_name,
      data.last_name,
      data.email,
      data.password_hash,
      data.phone || null,
      data.specialty,
      data.bio || null
    ]
  );

  return {
    ...result.rows[0],
    account_type: 'trainer'
  };
}

export async function updateLastLogin(accountType, accountId) {
  const table = accountType === 'trainer' ? 'trainers' : 'learners';

  await pool.query(
    `
      UPDATE ${table}
      SET last_login_at = NOW()
      WHERE id = $1
    `,
    [accountId]
  );
}

export async function createRefreshToken(data) {
  const result = await pool.query(
    `
      INSERT INTO refresh_tokens (
        token_hash,
        account_type,
        account_id,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, expires_at
    `,
    [
      data.token_hash,
      data.account_type,
      data.account_id,
      data.expires_at
    ]
  );

  return result.rows[0];
}

export async function findRefreshToken(tokenHash) {
  const result = await pool.query(
    `
      SELECT
        id,
        token_hash,
        account_type,
        account_id,
        expires_at,
        revoked_at
      FROM refresh_tokens
      WHERE token_hash = $1
        AND revoked_at IS NULL
        AND expires_at > NOW()
    `,
    [tokenHash]
  );

  return result.rows[0] || null;
}

export async function revokeRefreshToken(id) {
  await pool.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE id = $1
    `,
    [id]
  );
}




export async function findAccountById(accountType, accountId) {
  if (accountType === 'learner') {
    const result = await pool.query(
      `
        SELECT
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
        FROM learners
        WHERE id = $1
      `,
      [accountId]
    );

    return result.rows[0] || null;
  }

  if (accountType === 'trainer') {
    const result = await pool.query(
      `
        SELECT
          id,
          first_name,
          last_name,
          email,
          phone,
          specialty,
          bio,
          status,
          'trainer' AS account_type
        FROM trainers
        WHERE id = $1
      `,
      [accountId]
    );

    return result.rows[0] || null;
  }

  return null;
}