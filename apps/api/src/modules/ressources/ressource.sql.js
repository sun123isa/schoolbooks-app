// =============================================================================
// Module RESSOURCES — fragments SQL et correspondance SQL → contrat
// Responsable : Emmanuel AYA — relecture : Salem KONGOLO
// Partagé par ressources.repository.js et recherche.repository.js (Salem) :
// une ressource est lue et mise au format du contrat d'une seule manière.
// Colonnes SQL en anglais, champs du contrat en français (voir README § 4).
// =============================================================================

// Colonnes lues pour une ressource : books + code/libellé des référentiels.
export const COLONNES_RESSOURCE = `
  b.id,
  b.title,
  b.author,
  b.description,
  b.year,
  b.is_downloadable,
  b.usage_rights,
  b.file_size,
  b.file_path,
  b.created_at,
  l.code  AS level_code,   l.label AS level_label,
  t.code  AS track_code,   t.label AS track_label,
  s.code  AS subject_code, s.label AS subject_label,
  d.code  AS type_code,    d.label AS type_label`;

// Jointures : niveau, matière et type obligatoires (BR01/BR03/BR05), filière facultative.
export const JOINTURES_RESSOURCE = `
  FROM books b
  JOIN levels l ON l.id = b.level_id
  LEFT JOIN tracks t ON t.id = b.track_id
  JOIN subjects s ON s.id = b.subject_id
  JOIN document_types d ON d.id = b.document_type_id`;

// Ressource publiée : active et complète (les JOIN excluent déjà les référentiels absents).
export const CONDITION_PUBLIEE = 'b.is_active = TRUE';

// Texte de recherche normalisé (minuscules, sans accents) : même expression que
// l'index trigramme de la migration 006, pour que PostgreSQL puisse l'utiliser.
export const TEXTE_RECHERCHE = "texte_normalise(b.title || ' ' || COALESCE(b.description, ''))";
export const TITRE_NORMALISE = 'texte_normalise(b.title)';

const reference = (code, libelle) => (code ? { code, libelle } : null);

// Ligne SQL → RessourceResume (packages/shared/src/contract/ressources.schema.js).
export function versResume(ligne) {
  return {
    id: ligne.id,
    titre: ligne.title,
    niveau: reference(ligne.level_code, ligne.level_label),
    filiere: reference(ligne.track_code, ligne.track_label),
    matiere: reference(ligne.subject_code, ligne.subject_label),
    type: reference(ligne.type_code, ligne.type_label),
    annee: ligne.year ?? null,
    format: 'PDF',
    telechargeable: ligne.is_downloadable
  };
}

// Échappe les caractères spéciaux de LIKE (« % », « _ », « \ ») d'un mot-clé saisi.
export function motifLike(texte) {
  return `%${texte.replace(/[\\%_]/g, '\\$&')}%`;
}
