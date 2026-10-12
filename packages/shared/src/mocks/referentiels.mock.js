// =============================================================================
// Données fictives — référentiels
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Les codes sont identiques à ceux du seed SQL database/seeds/002_seed_referentiels_ressources.sql,
// pour que le passage des mocks à la vraie base soit transparent pour le frontend.
// =============================================================================

export const NIVEAUX = [
  { code: 'lycee', libelle: 'Lycée' },
  { code: 'universite', libelle: 'Université' }
];

export const FILIERES = [
  { code: 'serie-a', libelle: 'Série A — Lettres et philosophie', niveau: 'lycee' },
  { code: 'serie-c', libelle: 'Série C — Mathématiques et sciences physiques', niveau: 'lycee' },
  { code: 'serie-d', libelle: 'Série D — Sciences de la vie et de la Terre', niveau: 'lycee' },
  { code: 'licence-informatique', libelle: 'Licence Informatique', niveau: 'universite' },
  { code: 'licence-economie', libelle: 'Licence Sciences économiques', niveau: 'universite' },
  { code: 'licence-droit', libelle: 'Licence Droit', niveau: 'universite' }
];

export const MATIERES = [
  { code: 'anglais', libelle: 'Anglais' },
  { code: 'droit', libelle: 'Droit' },
  { code: 'economie', libelle: 'Économie' },
  { code: 'francais', libelle: 'Français' },
  { code: 'histoire-geographie', libelle: 'Histoire-Géographie' },
  { code: 'informatique', libelle: 'Informatique' },
  { code: 'mathematiques', libelle: 'Mathématiques' },
  { code: 'philosophie', libelle: 'Philosophie' },
  { code: 'physique-chimie', libelle: 'Physique-Chimie' },
  { code: 'svt', libelle: 'Sciences de la vie et de la Terre' }
];

export const TYPES_DOCUMENTS = [
  { code: 'sujet-examen', libelle: "Sujet d'examen", requiertAnnee: true },
  { code: 'corrige', libelle: "Corrigé d'examen", requiertAnnee: true },
  { code: 'livre', libelle: 'Livre', requiertAnnee: false },
  { code: 'cours', libelle: 'Support de cours', requiertAnnee: false },
  { code: 'exercices', libelle: "Fiches d'exercices", requiertAnnee: false }
];

// Retourne les filières d'un niveau, ou null si le niveau n'existe pas.
export function listerFilieresMock(codeNiveau) {
  if (!NIVEAUX.some((niveau) => niveau.code === codeNiveau)) {
    return null;
  }
  return FILIERES.filter((filiere) => filiere.niveau === codeNiveau);
}
