// =============================================================================
// Module BOOKS — repository (requêtes SQL uniquement)
// Un livre est une ligne de books rattachée aux référentiels (migration 005) :
// il apparaît donc aussi dans la recherche de ressources. Les colonnes
// historiques level / subject / category (NOT NULL, migration 003) reçoivent
// les libellés des référentiels, comme pour l'intégration au catalogue.
// =============================================================================
import { pool } from '../../config/database.js';
import { JOINTURES_RESSOURCE, TEXTE_RECHERCHE, TITRE_NORMALISE, motifLike } from '../ressources/ressource.sql.js';

const COLONNES_LIVRE = `
  b.id, b.title, b.author, b.description, b.year, b.is_downloadable, b.usage_rights,
  b.file_name, b.file_path, b.file_size, b.download_count, b.is_active, b.deactivated_at,
  b.trainer_id, b.created_at, b.updated_at,
  l.code AS level_code,   l.label AS level_label,
  t.code AS track_code,   t.label AS track_label,
  s.code AS subject_code, s.label AS subject_label,
  d.code AS type_code,    d.label AS type_label,
  tr.first_name AS trainer_first_name, tr.last_name AS trainer_last_name`;

const JOINTURES_LIVRE = `${JOINTURES_RESSOURCE}
  LEFT JOIN trainers tr ON tr.id = b.trainer_id`;

const TRIS = {
  recent: 'b.created_at DESC, b.id',
  titre: `${TITRE_NORMALISE} ASC, b.id`,
  telechargements: 'b.download_count DESC, b.created_at DESC, b.id'
};

// Catalogue public : livres actifs publiés par un formateur, filtrés par mot-clé,
// niveau et matière (les ressources du catalogue restent dans /api/ressources).
export async function listerLivresPublies({ q, niveau, matiere, page, limit, tri }) {
  const conditions = ['b.is_active = TRUE', 'b.trainer_id IS NOT NULL'];
  const valeurs = [];
  const parametre = (valeur) => {
    valeurs.push(valeur);
    return `$${valeurs.length}`;
  };
  if (niveau) conditions.push(`l.code = ${parametre(niveau)}`);
  if (matiere) conditions.push(`s.code = ${parametre(matiere)}`);
  if (q) conditions.push(`${TEXTE_RECHERCHE} LIKE texte_normalise(${parametre(motifLike(q))})`);
  const where = `WHERE ${conditions.join(' AND ')}`;
  const valeursFiltres = [...valeurs];
  const pagination = `LIMIT ${parametre(limit)} OFFSET ${parametre((page - 1) * limit)}`;

  const [lignes, compte] = await Promise.all([
    pool.query(
      `SELECT ${COLONNES_LIVRE} ${JOINTURES_LIVRE} ${where} ORDER BY ${TRIS[tri] ?? TRIS.recent} ${pagination}`,
      valeurs
    ),
    pool.query(`SELECT COUNT(*)::int AS total ${JOINTURES_LIVRE} ${where}`, valeursFiltres)
  ]);
  return { lignes: lignes.rows, total: compte.rows[0].total };
}

// Livre complet (référentiels renseignés), actif ou non : le service décide
// qui peut voir un livre désactivé.
export async function findLivre(id) {
  const { rows } = await pool.query(`SELECT ${COLONNES_LIVRE} ${JOINTURES_LIVRE} WHERE b.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function findLivreParFichier(cheminRelatif) {
  const { rows } = await pool.query(
    'SELECT id, is_active, trainer_id, file_path, title FROM books WHERE file_path = $1',
    [cheminRelatif]
  );
  return rows[0] ?? null;
}

export async function listerLivresFormateur(trainerId) {
  const { rows } = await pool.query(
    `SELECT ${COLONNES_LIVRE} ${JOINTURES_LIVRE}
      WHERE b.trainer_id = $1
      ORDER BY b.is_active DESC, b.created_at DESC, b.id`,
    [trainerId]
  );
  return rows;
}

// Tableau de bord : nombre de livres, téléchargements, livres actifs, matières utilisées.
export async function statistiquesFormateur(trainerId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int                                   AS livres,
            COALESCE(SUM(download_count), 0)::int           AS telechargements,
            COUNT(*) FILTER (WHERE is_active)::int          AS actifs,
            COUNT(DISTINCT subject_id)::int                 AS matieres
       FROM books
      WHERE trainer_id = $1`,
    [trainerId]
  );
  return rows[0];
}

// Résout les codes en identifiants. Renvoie null pour un code inconnu ou une
// filière qui n'appartient pas au niveau (BR02).
export async function resoudreReferentiels({ niveau, matiere, type, filiere }) {
  const { rows } = await pool.query(
    `SELECT l.id AS level_id, l.label AS level_label,
            s.id AS subject_id, s.label AS subject_label,
            d.id AS type_id, d.label AS type_label, d.requires_year,
            (SELECT t.id FROM tracks t WHERE t.code = $4 AND t.level_id = l.id) AS track_id
       FROM levels l, subjects s, document_types d
      WHERE l.code = $1 AND s.code = $2 AND d.code = $3`,
    [niveau, matiere, type, filiere ?? null]
  );
  return rows[0] ?? null;
}

export async function creerLivre(l) {
  const { rows } = await pool.query(
    `INSERT INTO books (
       title, author, description, level, subject, category,
       file_name, file_path, file_size, mime_type, file_checksum, is_active, trainer_id,
       level_id, track_id, subject_id, document_type_id, year, is_downloadable, usage_rights
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'application/pdf', $10, TRUE, $11,
               $12, $13, $14, $15, $16, $17, $18)
     RETURNING id`,
    [
      l.titre,
      l.auteur,
      l.description,
      l.levelLabel,
      l.subjectLabel,
      l.typeLabel,
      l.nomFichier,
      l.cheminFichier,
      l.tailleOctets,
      l.empreinte,
      l.trainerId,
      l.levelId,
      l.trackId,
      l.subjectId,
      l.typeId,
      l.annee,
      l.telechargeable,
      l.droits
    ]
  );
  return rows[0].id;
}

// Colonnes modifiables : nom SQL → valeur. Seules les clés fournies sont mises à jour.
const COLONNES_MODIFIABLES = {
  titre: 'title',
  auteur: 'author',
  description: 'description',
  levelLabel: 'level',
  subjectLabel: 'subject',
  typeLabel: 'category',
  levelId: 'level_id',
  trackId: 'track_id',
  subjectId: 'subject_id',
  typeId: 'document_type_id',
  annee: 'year',
  telechargeable: 'is_downloadable',
  droits: 'usage_rights',
  nomFichier: 'file_name',
  cheminFichier: 'file_path',
  tailleOctets: 'file_size',
  empreinte: 'file_checksum'
};

export async function modifierLivre(id, modifications) {
  const affectations = [];
  const valeurs = [];
  for (const [cle, colonne] of Object.entries(COLONNES_MODIFIABLES)) {
    if (modifications[cle] === undefined) continue;
    valeurs.push(modifications[cle]);
    affectations.push(`${colonne} = $${valeurs.length}`);
  }
  valeurs.push(id);
  await pool.query(
    `UPDATE books SET ${[...affectations, 'updated_at = NOW()'].join(', ')} WHERE id = $${valeurs.length}`,
    valeurs
  );
}

export async function changerActivation(id, actif) {
  await pool.query(
    `UPDATE books
        SET is_active = $2,
            deactivated_at = CASE WHEN $2 THEN NULL ELSE NOW() END,
            updated_at = NOW()
      WHERE id = $1`,
    [id, actif]
  );
}

export async function supprimerLivre(id) {
  await pool.query('DELETE FROM books WHERE id = $1', [id]);
}

export async function incrementerTelechargements(id) {
  await pool.query('UPDATE books SET download_count = download_count + 1 WHERE id = $1', [id]);
}

// BR09 : même titre (sans casse ni accents), niveau, matière, type et année.
// Les livres désactivés comptent aussi : on les restaure au lieu de les dupliquer.
export async function findDoublonMetadonnees({ titre, levelId, subjectId, typeId, annee }, saufId = null) {
  const { rows } = await pool.query(
    `SELECT id, title
       FROM books
      WHERE texte_normalise(title) = texte_normalise($1)
        AND level_id = $2 AND subject_id = $3 AND document_type_id = $4
        AND year IS NOT DISTINCT FROM $5::smallint
        AND ($6::uuid IS NULL OR id <> $6)
      LIMIT 1`,
    [titre, levelId, subjectId, typeId, annee ?? null, saufId]
  );
  return rows[0] ?? null;
}

// BR09 : un même fichier ne peut figurer qu'une fois au catalogue.
export async function findParEmpreinte(empreinte, saufId = null) {
  const { rows } = await pool.query(
    'SELECT id, title FROM books WHERE file_checksum = $1 AND ($2::uuid IS NULL OR id <> $2) LIMIT 1',
    [empreinte, saufId]
  );
  return rows[0] ?? null;
}
