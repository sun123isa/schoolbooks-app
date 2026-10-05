// =============================================================================
// Landing page — contenu textuel, chiffres et liens (séparés de la présentation)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
//
// Ordre des sections (identique à la maquette de référence) :
//   en-tête · hero · bandeau de chiffres · nos ressources · à propos ·
//   ajoutées récemment · appel à l'action · pied de page.
//
// Photos : Unsplash (licence Unsplash, usage commercial libre) — auteurs et
// liens d'origine listés dans ./assets/README.md.
//
// Codes de référentiel (niveau, type, tri) : identiques au contrat partagé
// (@schoolbooks/shared) — vérifiés par landing.content.test.js.
// =============================================================================
import { cheminRecherche } from '../../app/routes.js';
import { ANCRE_A_PROPOS } from '../../shared/layout/layout.content.js';
import imageHeroFond from './assets/hero-fond-bibliotheque.webp';
import imageHeroPortrait from './assets/hero-etudiante.webp';
import imageRessources from './assets/ressources-etudiant-ordinateur.webp';
import imageAPropos from './assets/a-propos-campus.webp';
import imageNouveaute1 from './assets/nouveaute-bibliotheque.webp';
import imageNouveaute2 from './assets/nouveaute-lycee.webp';
import imageNouveaute3 from './assets/nouveaute-diplomes.webp';
import imageCta from './assets/cta-etudiants-pelouse.webp';

export const HERO = {
  surtitre: ['Apprendre', 'Réviser', 'Réussir'],
  titre: "Vos ressources d'examen, réunies",
  // Seul effet typographique d'accent de la page (police manuscrite).
  titreAccent: 'Ici',
  description:
    "ScolaRead réunit sujets d'examens, livres et supports pédagogiques adaptés à votre niveau et à votre série ou filière, pour réviser sans perdre de temps.",
  actions: {
    principale: { libelle: 'Explorer les ressources', to: cheminRecherche() },
    secondaire: { libelle: 'Découvrir le concept', ancre: ANCRE_A_PROPOS }
  },
  annotation: ['Plus qu’une', 'simple', 'bibliothèque'],
  // Étiquettes flottantes autour du portrait (décoratives).
  etiquettes: [
    { icone: 'examen', texte: 'Sujets & corrigés' },
    { icone: 'pdf', texte: 'Lecture en PDF' }
  ],
  // Fond : décoratif (alt vide). Portrait : image principale, chargée en priorité.
  fond: { src: imageHeroFond, largeur: 1920, hauteur: 1080 },
  portrait: {
    src: imageHeroPortrait,
    largeur: 1000,
    hauteur: 1250,
    alt: 'Étudiante souriante, sac sur l’épaule et notes à la main, devant un bâtiment universitaire'
  }
};

// Bandeau de chiffres : valeurs calculées à partir de l'API (landing.api.js).
// `provisoire` : affiché UNIQUEMENT si l'API ne répond pas — valeurs à valider.
export const CHIFFRES = [
  { id: 'niveaux', icone: 'niveaux', libelle: 'Niveaux couverts', provisoire: 'Lycée & Université' },
  { id: 'ressources', icone: 'ressources', libelle: 'Ressources disponibles', provisoire: '10+' },
  { id: 'matieres', icone: 'matieres', libelle: 'Matières couvertes', provisoire: '10' },
  { id: 'types', icone: 'types', libelle: 'Types de documents', provisoire: '5' }
];

export const RESSOURCES = {
  surtitre: 'Nos ressources',
  titre: 'Explorez nos ressources pédagogiques',
  texte:
    'Des sujets du baccalauréat aux cours de licence, trouvez la ressource qui correspond à votre niveau et à votre filière.',
  bouton: { libelle: 'Voir toutes les ressources', to: cheminRecherche() },
  image: {
    src: imageRessources,
    largeur: 1200,
    hauteur: 900,
    alt: 'Étudiant concentré travaillant sur son ordinateur portable'
  },
  carteFlottante: {
    titre: 'Consultation en ligne',
    texte: 'Lisez vos PDF partout',
    lien: { libelle: 'Lancer une recherche', to: cheminRecherche() }
  },
  // Une carte par type de document du contrat → recherche filtrée par type.
  cartes: [
    { type: 'sujet-examen', titre: "Sujets d'examens", texte: 'Baccalauréat et examens de licence' },
    { type: 'corrige', titre: "Corrigés d'examens", texte: 'Corrections détaillées, pas à pas' },
    { type: 'livre', titre: 'Livres & manuels', texte: 'Ouvrages de référence par matière' },
    { type: 'cours', titre: 'Supports de cours', texte: 'Cours structurés par chapitre' },
    { type: 'exercices', titre: "Fiches d'exercices", texte: 'Entraînement et applications' }
  ].map((carte) => ({ ...carte, to: cheminRecherche({ type: carte.type }) }))
};

export const A_PROPOS = {
  ancre: ANCRE_A_PROPOS,
  surtitre: 'À propos de ScolaRead',
  titre: ['Un seul endroit pour', 'réviser sereinement'],
  // Paragraphe en segments : `fort: true` = passage mis en gras.
  texte: [
    { texte: 'Chez ScolaRead, ' },
    { texte: 'réviser ne devrait pas commencer par une chasse aux documents.', fort: true },
    {
      texte:
        ' Sujets et cours circulent entre groupes de discussion, fichiers partagés, camarades et enseignants : nous les '
    },
    { texte: 'réunissons et les classons', fort: true },
    { texte: ' par niveau, série ou filière, matière et année.' }
  ],
  atouts: [
    { icone: 'niveau', libelle: ['Classées par niveau', '& filière'] },
    { icone: 'filtres', libelle: ['Filtres par matière', '& année'] },
    { icone: 'pdf', libelle: ['Lecture en ligne', '& PDF'] }
  ],
  bouton: { libelle: 'Commencer une recherche', to: cheminRecherche() },
  image: {
    src: imageAPropos,
    largeur: 1200,
    hauteur: 1000,
    alt: 'Deux étudiants, sac au dos, marchant vers un bâtiment universitaire'
  }
};

export const NOUVEAUTES = {
  surtitre: 'Ajoutées récemment',
  titre: 'Nouveautés du catalogue',
  texte: 'Les dernières ressources intégrées à la bibliothèque, vérifiées et classées.',
  lienTout: { libelle: 'Voir tout le catalogue', to: cheminRecherche({ tri: 'recent' }) },
  lienCarte: 'Consulter',
  nombre: 3,
  // Les ressources n'ont pas d'image dans l'API : une illustration par position.
  images: [imageNouveaute1, imageNouveaute2, imageNouveaute3],
  vide: 'Aucune ressource pour le moment.'
};

export const APPEL_A_L_ACTION = {
  titre: 'Cherchez. Consultez. Réussissez.',
  texte: 'Rejoignez les élèves et étudiants qui révisent avec les bonnes ressources.',
  bouton: { libelle: 'Lancer une recherche', to: cheminRecherche() },
  image: imageCta // décorative, en arrière-plan
};
