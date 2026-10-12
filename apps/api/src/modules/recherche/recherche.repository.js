// =============================================================================
// Module RECHERCHE — repository (requêtes SQL uniquement)
// Responsable : Salem KONGOLO — relecture : HIRWA Jean Baptiste
//
// rechercherRessources(query) -> Promise<{ rows: RessourceResume[], total: number }>
//   query = sortie de RechercheQuerySchema (q, niveau, filiere, matiere, annee,
//   type, page, limit, tri), déjà validée.
//
// - books jointe à levels, tracks, subjects, document_types (fragments partagés
//   avec le module ressources : ../ressources/ressource.sql.js) ;
// - seules les ressources publiées et complètes (BR01/BR03/BR05) ;
// - filtres stricts par égalité sur les codes et l'année (BR07) ;
// - mot-clé insensible à la casse et aux accents (fonction texte_normalise et
//   index trigramme, migration 006) ;
// - requêtes paramétrées uniquement ($1, $2...).
// =============================================================================
import { pool } from '../../config/database.js';
import {
  COLONNES_RESSOURCE,
  CONDITION_PUBLIEE,
  JOINTURES_RESSOURCE,
  TEXTE_RECHERCHE,
  TITRE_NORMALISE,
  motifLike,
  versResume
} from '../ressources/ressource.sql.js';

// Clause WHERE et valeurs associées, construites à partir des filtres fournis.
function construireConditions({ q, niveau, filiere, matiere, annee, type }) {
  const conditions = [CONDITION_PUBLIEE];
  const valeurs = [];
  const parametre = (valeur) => {
    valeurs.push(valeur);
    return `$${valeurs.length}`;
  };

  if (niveau) conditions.push(`l.code = ${parametre(niveau)}`);
  if (filiere) conditions.push(`t.code = ${parametre(filiere)}`);
  if (matiere) conditions.push(`s.code = ${parametre(matiere)}`);
  if (annee) conditions.push(`b.year = ${parametre(annee)}`);
  if (type) conditions.push(`d.code = ${parametre(type)}`);

  let motif = null;
  if (q) {
    motif = parametre(motifLike(q));
    conditions.push(`${TEXTE_RECHERCHE} LIKE texte_normalise(${motif})`);
  }

  return { where: `WHERE ${conditions.join(' AND ')}`, valeurs, motif };
}

// ORDER BY selon le tri demandé. Le titre et l'id servent de départage stable
// (une même recherche renvoie toujours le même ordre, d'une page à l'autre).
function construireTri(tri, motif) {
  switch (tri) {
    case 'titre':
      return `ORDER BY ${TITRE_NORMALISE} ASC, b.id`;
    case 'recent':
      return `ORDER BY b.year DESC NULLS LAST, b.created_at DESC, ${TITRE_NORMALISE} ASC, b.id`;
    case 'pertinence':
    default:
      // Avec mot-clé : les ressources dont le TITRE contient le mot-clé d'abord.
      // Sans mot-clé : les ajouts les plus récents d'abord.
      return motif
        ? `ORDER BY (${TITRE_NORMALISE} LIKE texte_normalise(${motif})) DESC, b.created_at DESC, b.id`
        : `ORDER BY b.created_at DESC, ${TITRE_NORMALISE} ASC, b.id`;
  }
}

export async function rechercherRessources(query) {
  const { where, valeurs, motif } = construireConditions(query);
  const offset = (query.page - 1) * query.limit;

  const [page, compte] = await Promise.all([
    pool.query(
      `SELECT ${COLONNES_RESSOURCE}
         ${JOINTURES_RESSOURCE}
         ${where}
         ${construireTri(query.tri, motif)}
         LIMIT $${valeurs.length + 1} OFFSET $${valeurs.length + 2}`,
      [...valeurs, query.limit, offset]
    ),
    pool.query(`SELECT COUNT(*)::int AS total ${JOINTURES_RESSOURCE} ${where}`, valeurs)
  ]);

  return { rows: page.rows.map(versResume), total: compte.rows[0].total };
}
