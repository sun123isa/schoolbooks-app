// =============================================================================
// Module RESSOURCES — repository (requêtes SQL uniquement)
// Responsable : Emmanuel AYA — relecture : Salem KONGOLO
//
//   findRessourceById(id) -> Promise<ligne | null>
//     colonnes de books + code/libellé du niveau, de la filière, de la matière
//     et du type, y compris file_path (usage interne uniquement, jamais renvoyé
//     au client). Ressources publiées uniquement.
//   incrementerTelechargements(id) -> Promise<void>
//   findDoublon({ fileChecksum, titre, niveau, matiere, type, annee }) -> Promise<ligne | null>  (BR09)
//   insererRessource(ressource) -> Promise<{ id }>  (intégration au catalogue)
// =============================================================================
import { pool } from '../../config/database.js';
import { COLONNES_RESSOURCE, CONDITION_PUBLIEE, JOINTURES_RESSOURCE } from './ressource.sql.js';

export async function findRessourceById(id) {
  const { rows } = await pool.query(
    `SELECT ${COLONNES_RESSOURCE}
       ${JOINTURES_RESSOURCE}
      WHERE b.id = $1 AND ${CONDITION_PUBLIEE}`,
    [id]
  );
  return rows[0] ?? null;
}

export async function incrementerTelechargements(id) {
  await pool.query('UPDATE books SET download_count = download_count + 1 WHERE id = $1', [id]);
}

// BR09 — même fichier (empreinte SHA-256), ou même titre (sans casse ni accents),
// niveau, matière, type et année. Les ressources retirées comptent aussi :
// réintégrer un document retiré se fait en le réactivant, pas en le dupliquant.
export async function findDoublon({ fileChecksum, titre, niveau, matiere, type, annee }) {
  const { rows } = await pool.query(
    `SELECT b.id, b.title
       FROM books b
       LEFT JOIN levels l ON l.id = b.level_id
       LEFT JOIN subjects s ON s.id = b.subject_id
       LEFT JOIN document_types d ON d.id = b.document_type_id
      WHERE ($1::char(64) IS NOT NULL AND b.file_checksum = $1)
         OR (texte_normalise(b.title) = texte_normalise($2)
             AND l.code = $3 AND s.code = $4 AND d.code = $5
             AND b.year IS NOT DISTINCT FROM $6::smallint)
      LIMIT 1`,
    [fileChecksum ?? null, titre, niveau, matiere, type, annee ?? null]
  );
  return rows[0] ?? null;
}

// Insère une ressource déjà validée (catalogue.validator.js). Les identifiants
// des référentiels sont résolus à partir des codes. Les colonnes historiques
// level / subject / category (NOT NULL, migration 003) reçoivent les libellés.
export async function insererRessource(r) {
  const { rows } = await pool.query(
    `INSERT INTO books (
       title, author, description, level, subject, category,
       file_name, file_path, file_size, mime_type, file_checksum, is_active,
       level_id, track_id, subject_id, document_type_id, year, is_downloadable, usage_rights
     )
     SELECT $1, $2, $3, l.label, s.label, d.label,
            $4, $5, $6, 'application/pdf', $7, TRUE,
            l.id, t.id, s.id, d.id, $8, $9, $10
       FROM levels l
       JOIN subjects s ON s.code = $12
       JOIN document_types d ON d.code = $13
       LEFT JOIN tracks t ON t.code = $14 AND t.level_id = l.id
      WHERE l.code = $11
     RETURNING id`,
    [
      r.titre,
      r.auteur ?? null,
      r.description ?? null,
      r.nomFichier,
      r.cheminFichier,
      r.tailleOctets,
      r.empreinte,
      r.annee ?? null,
      r.telechargeable,
      r.droits,
      r.niveau,
      r.matiere,
      r.type,
      r.filiere ?? null
    ]
  );
  return rows[0];
}
