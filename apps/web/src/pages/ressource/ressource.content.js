// =============================================================================
// Page de consultation — textes et logique de présentation (sans React)
// Responsable : Karene MOUSSOUNDA — relecture : Salem KONGOLO
// Implémentation : HIRWA Jean Baptiste (intérim), à reprendre par Karene.
// Fonctions pures testées dans ressource.content.test.js.
// =============================================================================

export const TEXTES = {
  retour: 'Retour aux résultats',
  telecharger: 'Télécharger le PDF',
  consultationSeule: 'Consultation en ligne uniquement',
  chargement: 'Chargement de la ressource…',
  informations: 'Informations',
  description: 'Description',
  droits: "Droits d'utilisation",
  droitsInconnus: "Les conditions d'utilisation de ce document ne sont pas précisées.",
  introuvable: {
    titre: 'Ressource introuvable',
    texte: "Cette ressource n'existe pas ou n'est plus disponible. Elle a peut-être été retirée du catalogue.",
    bouton: 'Retour à la recherche'
  },
  fichierIndisponible:
    'Le document de cette ressource est momentanément inaccessible. Les informations de la fiche restent consultables.',
  visionneuse: {
    label: (titre) => `Visionneuse : ${titre}`,
    chargement: 'Ouverture du document…',
    precedente: 'Page précédente',
    suivante: 'Page suivante',
    numeroPage: 'Numéro de page',
    sur: 'sur',
    zoomMoins: 'Zoom arrière',
    zoomPlus: 'Zoom avant',
    ajuster: 'Ajuster à la largeur',
    pleinEcran: 'Plein écran',
    quitterPleinEcran: 'Quitter le plein écran',
    aide: 'Flèches ← → pour changer de page, + et − pour zoomer. Sur écran tactile, glissez vers la gauche ou la droite.'
  }
};

// 412000 → « 402 Ko » ; 7340032 → « 7,0 Mo ». null → null.
export function formaterTaille(octets) {
  if (octets === null || octets === undefined) return null;
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mo`;
}

// '2026-09-01T08:00:00.000Z' → « 1 septembre 2026 ».
export function formaterDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// Lignes de la fiche, dans l'ordre d'affichage ; les valeurs absentes sont omises.
export function informations(ressource) {
  return [
    { id: 'niveau', label: 'Niveau', valeur: ressource.niveau?.libelle },
    { id: 'filiere', label: 'Série / filière', valeur: ressource.filiere?.libelle ?? 'Toutes séries' },
    { id: 'matiere', label: 'Matière', valeur: ressource.matiere?.libelle },
    { id: 'annee', label: 'Année', valeur: ressource.annee ? String(ressource.annee) : null },
    { id: 'type', label: 'Type', valeur: ressource.type?.libelle },
    { id: 'format', label: 'Format', valeur: ressource.format },
    { id: 'taille', label: 'Taille', valeur: formaterTaille(ressource.tailleOctets) },
    { id: 'auteur', label: 'Auteur', valeur: ressource.auteur },
    { id: 'ajout', label: 'Ajoutée le', valeur: formaterDate(ressource.dateAjout) }
  ].filter((ligne) => ligne.valeur);
}

// BR08 : « Télécharger » uniquement si autorisé ET si le fichier est accessible.
export function peutTelecharger(ressource, fichierEnErreur = false) {
  return Boolean(ressource?.telechargeable && ressource.urls?.telechargement && ressource.disponible && !fichierEnErreur);
}

// Zoom de la visionneuse : paliers successifs, bornés.
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 3;
const PALIER = 1.25;

export function zoomSuivant(echelle, sens) {
  const suivante = sens > 0 ? echelle * PALIER : echelle / PALIER;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(suivante * 100) / 100));
}
