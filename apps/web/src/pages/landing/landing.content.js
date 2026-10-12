// =============================================================================
// Landing page — contenu textuel, chiffres et liens (séparés de la présentation)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
//
// Ordre des sections :
//   en-tête · hero · nos ressources · à propos · pour les formateurs ·
//   appel à l'action · pied de page.
//
// Photos : Unsplash (licence Unsplash, usage commercial libre) — auteurs et
// liens d'origine listés dans ./assets/README.md.
//
// Codes de référentiel (niveau, type, tri) : identiques au contrat partagé
// (@schoolbooks/shared) — vérifiés par landing.content.test.js.
// =============================================================================
import { cheminConnexion, cheminInscription, cheminRecherche } from '../../app/routes.js';
import { ANCRE_A_PROPOS } from '../../shared/layout/layout.content.js';
import imageHeroFond from './assets/hero-fond-bibliotheque.webp';
import imageHeroPortrait from './assets/hero-etudiante.webp';
import imageRessources from './assets/ressources-etudiant-ordinateur.webp';
import imageAProposGroupe from './assets/a-propos-groupe.webp';
import imageAProposRevision from './assets/a-propos-revision.webp';
import imageBibliotheque from './assets/nouveaute-bibliotheque.webp';
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
    // Masquée sur smartphone : la grille reste en 2 × 2.
    {
      type: 'exercices',
      titre: "Fiches d'exercices",
      texte: 'Entraînement et applications',
      masqueMobile: true
    }
  ].map((carte) => ({ ...carte, to: cheminRecherche({ type: carte.type }) }))
};

export const A_PROPOS = {
  ancre: ANCRE_A_PROPOS,
  surtitre: 'À propos de ScolaRead',
  titre: ['La bibliothèque qui range', 'vos révisions pour vous'],
  intro:
    "Sujets d'examens et cours circulent partout, mais rarement au bon endroit. ScolaRead les réunit, les classe et les rend lisibles, pour que chaque lycéen et chaque étudiant trouve la bonne ressource en quelques secondes.",
  // La problématique (avant) et la réponse de ScolaRead (avec).
  avant: {
    titre: 'Avant',
    elements: [
      { icone: 'discussions', texte: 'Groupes de discussion' },
      { icone: 'fichiers', texte: 'Fichiers partagés' },
      { icone: 'camarades', texte: 'Camarades' },
      { icone: 'enseignants', texte: 'Enseignants' }
    ],
    conclusion: 'Des heures à chercher, sans savoir si le document est le bon.'
  },
  avec: {
    titre: 'Avec ScolaRead',
    elements: [
      'Un seul espace pour toutes vos ressources',
      'Classées par niveau, série, matière et année',
      'Lisibles en ligne, téléchargeables si autorisé'
    ]
  },
  // Carte flottante posée sur les photos.
  classement: { titre: 'Chaque document est classé par', criteres: ['Niveau', 'Série', 'Matière', 'Année'] },
  bouton: { libelle: 'Commencer une recherche', to: cheminRecherche() },
  images: {
    principale: {
      src: imageAProposGroupe,
      largeur: 1100,
      hauteur: 825,
      alt: 'Groupe d’étudiants travaillant ensemble autour d’une table, ordinateur et notes ouverts'
    },
    secondaire: {
      src: imageAProposRevision,
      largeur: 560,
      hauteur: 560,
      alt: 'Trois étudiantes relisant leurs copies ensemble'
    }
  }
};

// Section « Pour les formateurs » : présente l'espace de publication (et non le
// catalogue). Aucun chiffre : le visuel est une illustration du tableau de bord.
export const FORMATEURS = {
  surtitre: 'Pour les formateurs',
  titre: ['Partagez vos cours,', 'suivez leur impact'],
  texte:
    'Enseignants et formateurs publient leurs livres et supports PDF en quelques minutes. Chaque document est classé pour atteindre directement les élèves de la bonne série.',
  etapes: [
    {
      icone: 'compte',
      titre: 'Créez votre espace',
      texte: 'Un compte formateur gratuit, prêt en une minute.'
    },
    {
      icone: 'publier',
      titre: 'Déposez votre PDF',
      texte: 'Titre, niveau, matière : le livre est en ligne.'
    },
    {
      icone: 'suivre',
      titre: 'Suivez vos lecteurs',
      texte: 'Téléchargements, livres actifs, matières couvertes.'
    }
  ],
  boutons: {
    principal: { libelle: 'Créer mon espace formateur', to: cheminInscription('formateur') },
    secondaire: { libelle: 'J’ai déjà un compte', to: cheminConnexion('formateur') }
  },
  image: {
    src: imageBibliotheque,
    largeur: 1200,
    hauteur: 800,
    alt: 'Étudiant lisant entre les rayonnages d’une bibliothèque, une bibliothécaire range des livres'
  },
  // Étiquettes du visuel (illustration de l'espace formateur).
  visuel: {
    publie: { titre: 'Livre publié', texte: 'Visible dans le catalogue' },
    statistiques: 'Publications de la semaine',
    jauge: 'Livres actifs',
    jours: ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  }
};

export const APPEL_A_L_ACTION = {
  titre: 'Cherchez. Consultez. Réussissez.',
  texte: 'Rejoignez les élèves et étudiants qui révisent avec les bonnes ressources.',
  bouton: { libelle: 'Lancer une recherche', to: cheminRecherche() },
  image: imageCta // décorative, en arrière-plan
};
