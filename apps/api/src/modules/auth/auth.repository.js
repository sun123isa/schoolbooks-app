// =============================================================================
// Module AUTH — repository (requêtes SQL uniquement)
// Tables : learners, trainers (migrations 001, 002, 007), refresh_tokens (007).
// Les deux rôles vivent dans deux tables distinctes ; le repository renvoie
// une ligne commune : { id, role, first_name, last_name, email, level, specialty, password_hash }.
// =============================================================================
import { pool } from '../../config/database.js';

const TABLES = { learner: 'learners', trainer: 'trainers' };

const COLONNES = {
  learner: "id, 'learner' AS role, first_name, last_name, email, level, NULL::text AS specialty, password_hash, status",
  trainer: "id, 'trainer' AS role, first_name, last_name, email, NULL::text AS level, specialty, password_hash, status"
};

// Un e-mail identifie un seul compte, tous rôles confondus.
export async function emailExiste(email) {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM learners WHERE lower(email) = lower($1)
     UNION ALL
     SELECT 1 FROM trainers WHERE lower(email) = lower($1)
     LIMIT 1`,
    [email]
  );
  return rowCount > 0;
}

export async function findCompteParEmail(email) {
  const { rows } = await pool.query(
    `SELECT ${COLONNES.learner} FROM learners WHERE lower(email) = lower($1)
     UNION ALL
     SELECT ${COLONNES.trainer} FROM trainers WHERE lower(email) = lower($1)
     LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function findCompte(role, id) {
  const table = TABLES[role];
  if (!table) return null;
  const { rows } = await pool.query(`SELECT ${COLONNES[role]} FROM ${table} WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function creerApprenant({ prenom, nom, email, telephone, niveau, motDePasseHache }) {
  const { rows } = await pool.query(
    `INSERT INTO learners (first_name, last_name, email, phone, level, password_hash, last_login_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING ${COLONNES.learner}`,
    [prenom, nom, email, telephone ?? null, niveau, motDePasseHache]
  );
  return rows[0];
}

export async function creerFormateur({ prenom, nom, email, telephone, specialite, bio, motDePasseHache }) {
  const { rows } = await pool.query(
    `INSERT INTO trainers (first_name, last_name, email, phone, specialty, bio, password_hash, last_login_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING ${COLONNES.trainer}`,
    [prenom, nom, email, telephone ?? null, specialite, bio ?? null, motDePasseHache]
  );
  return rows[0];
}

export async function enregistrerConnexion(role, id) {
  await pool.query(`UPDATE ${TABLES[role]} SET last_login_at = NOW() WHERE id = $1`, [id]);
}

export async function niveauExiste(code) {
  const { rowCount } = await pool.query('SELECT 1 FROM levels WHERE code = $1', [code]);
  return rowCount > 0;
}

// --- Refresh tokens ------------------------------------------------------------

export async function creerRefreshToken({ userId, role, tokenHash, expireLe }) {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, user_role, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
    [userId, role, tokenHash, expireLe]
  );
}

// Session valide : non révoquée et non expirée.
export async function findRefreshTokenValide(tokenHash) {
  const { rows } = await pool.query(
    `SELECT id, user_id, user_role
       FROM refresh_tokens
      WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
    [tokenHash]
  );
  return rows[0] ?? null;
}

// Révocation atomique : renvoie false si le jeton était déjà révoqué (rejeu).
export async function revoquerRefreshToken(tokenHash) {
  const { rowCount } = await pool.query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL',
    [tokenHash]
  );
  return rowCount > 0;
}

// Ménage : jetons expirés depuis plus d'un jour.
export async function purgerRefreshTokensExpires() {
  await pool.query("DELETE FROM refresh_tokens WHERE expires_at < NOW() - INTERVAL '1 day'");
}
