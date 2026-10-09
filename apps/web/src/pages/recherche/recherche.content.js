// =============================================================================
// Page de recherche — textes et logique de présentation (sans React)
// Responsable : Graciel MBEMBA — relecture : Salem KONGOLO
// Textes séparés de la présentation ; fonctions pures testées dans
// recherche.content.test.js.
// =============================================================================
import { filiereCourte } from '../../shared/format/libelles.js';

export const TEXTES = {
  titre: 'Rechercher une ressource',
  sousTitre: "Sujets d'examens, corrigés, livres et supports de cours, classés par niveau, série ou filière, matière et année.",
  champ: {
    label: 'Mot-clé',
    placeholder: 'Ex. : Mathématiques 2023, dissertation, algorithmique…',
    bouton: 'Rechercher',
    effacer: 'Effacer le mot-clé'
  },
  filtres: {
    titre: 'Filtres',
    ouvrir: 'Afficher les filtres',
    fermer: 'Masquer les filtres',
    niveau: 'Niveau',
    tousNiveaux: 'Tous',
    filiere: 'Série / filière',
    filiereSansNiveau: "Choisissez d'abord un niveau",
    toutesFilieres: 'Toutes les séries / filières',
    matiere: 'Matière',
    toutesMatieres: 'Toutes les matières',
    annee: 'Année',
    toutesAnnees: 'Toutes les années',
    type: 'Type de document',
    tousTypes: 'Tous les types',
    reinitialiser: 'Réinitialiser les filtres',
    chargement: 'Chargement des filtres…'
  },
  actifs: {
    label: 'Critères appliqués',
    retirer: (libelle) => `Retirer le critère ${libelle}`,
    toutRetirer: 'Tout effacer'
  },
  resultats: {
    chargement: 'Recherche en cours…',
    tri: 'Trier par',
    aucunTitre: 'Aucune ressource trouvée',
    elargir: 'Essayez de retirer un critère pour élargir la recherche :',
    toutRetirer: 'Effacer tous les critères'
  },
  carte: {
    telechargeable: 'Téléchargeable',
    consultation: 'En ligne',
    toutesSeries: 'Toutes séries'
  },
  pagination: {
    label: 'Pagination des résultats',
    precedente: 'Page précédente',
    suivante: 'Page suivante',
    page: (n) => `Page ${n}`
  }
};

export const TRIS = [
  { code: 'pertinence', libelle: 'Pertinence' },
  { code: 'recent', libelle: 'Plus récentes' },
  { code: 'titre', libelle: 'Titre (A → Z)' }
];

// Ordre d'affichage des critères actifs.
const ORDRE_CRITERES = ['q', 'niveau', 'filiere', 'matiere', 'annee', 'type'];

// « 1 ressource trouvée », « 12 ressources trouvées ».
export function libelleTotal(total) {
  return `${total} ressource${total > 1 ? 's' : ''} trouvée${total > 1 ? 's' : ''}`;
}

// Critères actifs sous forme de pastilles : [{ cle, libelle }].
// Les libellés viennent des référentiels ; à défaut, le code brut est affiché.
export function criteresActifs(criteres, { niveaux = [], filieres = [], matieres = [], types = [] } = {}) {
  const libelleDe = (liste, code) => liste.find((item) => item.code === code)?.libelle ?? code;
  const libelles = {
    q: (v) => `« ${v} »`,
    niveau: (v) => libelleDe(niveaux, v),
    filiere: (v) => filiereCourte(libelleDe(filieres, v)),
    matiere: (v) => libelleDe(matieres, v),
    annee: (v) => String(v),
    type: (v) => libelleDe(types, v)
  };
  return ORDRE_CRITERES.filter((cle) => criteres[cle]).map((cle) => ({ cle, libelle: libelles[cle](criteres[cle]) }));
}

// Pages à afficher : toujours la première et la dernière, la page courante et
// ses voisines ; « … » pour les trous. Ex. (6, 12) → [1, '…', 5, 6, 7, '…', 12].
export function pagesAffichees(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => pages.add(p));
  const triees = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return triees.flatMap((p, i) => (i > 0 && p - triees[i - 1] > 1 ? ['…', p] : [p]));
}

// -----------------------------------------------------------------------------
// Note : Graciel MBEMBA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
