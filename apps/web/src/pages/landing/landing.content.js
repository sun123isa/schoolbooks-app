// =============================================================================
// Landing page — contenu textuel, chiffres et liens (séparés de la présentation)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
//
// ⚠ CONTENUS DE MAQUETTE À VALIDER : les chiffres (45,000+, 120+, 98%, 85k+)
// et mentions (« Certifié profs », « Conforme aux programmes officiels »,
// « BAC Mathématiques 2025 ») viennent de la maquette. Les corriger ici.
//
// ⚠ IMAGES DE SUBSTITUTION à remplacer par les photos définitives (mêmes
// proportions, format WebP conseillé, ≈ 1200 px de large pour le hero,
// ≈ 800 px pour les cartes) : voir ./assets/README.md.
//
// Codes de référentiel (niveau, matiere, type) : identiques au contrat partagé
// (@schoolbooks/shared) — vérifiés par landing.content.test.js.
// =============================================================================
import { cheminRecherche } from '../../app/routes.js';
import imageHero from './assets/hero-etudiante-bibliotheque.svg';
import imageRecherche from './assets/carte-recherche-intelligente.svg';
import imageRessources from './assets/carte-ressources-academiques.svg';
import imageTelechargement from './assets/carte-telechargement-facile.svg';

// Mot-clé saisi dans le hero → /recherche?q=… ; saisie vide → page de recherche sans critère.
export function cheminRechercheMotCle(motCle) {
  const q = typeof motCle === 'string' ? motCle.trim() : '';
  return cheminRecherche(q ? { q } : {});
}

export const HERO = {
  badge: 'La première bibliothèque académique numérique panafricaine',
  titreDebut: 'Apprenez mieux avec',
  titreAccent: 'les bonnes ressources',
  description:
    "Accédez facilement aux sujets d'examens, livres et supports pédagogiques adaptés à votre niveau et votre filière.",
  actions: {
    trouver: { libelle: 'Trouver une ressource', to: cheminRecherche() },
    catalogue: { libelle: 'Voir le catalogue', to: cheminRecherche() }
  },
  recherche: {
    label: 'Rechercher une ressource',
    placeholder: 'Ex: Mathématiques Terminale C, Droit constitutionnel L2, BAC',
    bouton: 'Rechercher',
    tendancesLabel: 'Tendances :',
    // Chaque tendance lance une recherche filtrée par matière (filtre strict, BR07).
    tendances: [
      { libelle: 'Maths', criteres: { matiere: 'mathematiques' } },
      { libelle: 'Physique', criteres: { matiere: 'physique-chimie' } },
      { libelle: 'Droit', criteres: { matiere: 'droit' } },
      { libelle: 'Économie', criteres: { matiere: 'economie' } },
      { libelle: 'SVT', criteres: { matiere: 'svt' } }
    ]
  },
  // CONTENU DE MAQUETTE — chiffres à valider.
  statistiques: [
    { valeur: '45,000+', libelle: 'Documents vérifiés' },
    { valeur: '120+', libelle: 'Universités & Lycées' },
    { valeur: '98%', libelle: 'Taux de réussite', accent: true }
  ],
  visuel: {
    image: imageHero, // IMAGE DE SUBSTITUTION
    largeur: 800,
    hauteur: 1000,
    alt: 'Étudiante travaillant sur un ordinateur portable dans une bibliothèque',
    examen: {
      surtitre: 'Examen national',
      titre: 'BAC Mathématiques 2025',
      detail: 'Corrigé officiel certifié (PDF)'
    },
    conformite: 'Conforme aux programmes officiels',
    etudiants: {
      valeur: '85k+ Étudiants',
      libelle: "Accompagnés cette année vers l'excellence"
    }
  }
};

export const ATOUTS = {
  badge: 'Excellence & Accessibilité',
  titre: 'Tout ce dont vous avez besoin pour réussir',
  sousTitre:
    "Une architecture pédagogique robuste conçue pour optimiser vos révisions et accélérer l'assimilation des connaissances.",
  cartes: [
    {
      id: 'recherche',
      titre: 'Recherche intelligente',
      texte:
        'Trouvez rapidement les documents adaptés à votre niveau et votre matière grâce à nos filtres pédagogiques précis.',
      badge: 'Filtres avancés',
      ton: 'primary',
      lien: { libelle: 'Tester la recherche multicritère', to: cheminRecherche() },
      image: imageRecherche, // IMAGE DE SUBSTITUTION
      alt: 'Deux étudiantes révisant ensemble autour de documents et d’un ordinateur'
    },
    {
      id: 'ressources',
      titre: 'Ressources académiques',
      texte:
        "Sujets d'examens, livres et supports pédagogiques centralisés et certifiés par des enseignants qualifiés.",
      badge: 'Certifié profs', // CONTENU DE MAQUETTE — mention à valider
      ton: 'primary',
      lien: { libelle: 'Consulter les annales certifiées', to: cheminRecherche({ type: 'sujet-examen' }) },
      image: imageRessources, // IMAGE DE SUBSTITUTION
      alt: 'Pile de manuels académiques sur un bureau de bibliothèque'
    },
    {
      id: 'telechargement',
      titre: 'Téléchargement facile',
      texte:
        'Lisez vos documents en ligne en mode liseuse haute clarté ou téléchargez-les en PDF pour réviser hors-ligne.',
      badge: 'Mode hors-ligne', // HORS MVP — mention visuelle seulement
      ton: 'accent',
      lien: { libelle: 'Découvrir la liseuse interactive', to: cheminRecherche() },
      image: imageTelechargement, // IMAGE DE SUBSTITUTION
      alt: 'Tablette et smartphone affichant un document de cours à côté d’un cahier'
    }
  ]
};

export const ETAPES = {
  surtitre: 'Méthodologie étudiante',
  titre: 'Comment fonctionne ScolaRead ?',
  sousTitre: "Un parcours fluide conçu pour l'autonomie et la réussite académique.",
  liste: [
    {
      numero: '01',
      ton: 'primary',
      titre: 'Choisissez votre niveau',
      texte: 'Sélectionnez Lycée (Seconde à Terminale) ou Université (Licence, Master, Grandes Écoles).',
      // Pastilles cliquables : recherche pré-filtrée par niveau (référentiel des niveaux).
      // Licence et Master relèvent du niveau « universite » (pas de niveau dédié au MVP).
      pastilles: [
        { libelle: 'Lycée', criteres: { niveau: 'lycee' } },
        { libelle: 'Licence', criteres: { niveau: 'universite' } },
        { libelle: 'Master', criteres: { niveau: 'universite' } }
      ],
      tonPastilles: 'neutral'
    },
    {
      numero: '02',
      ton: 'primary',
      titre: 'Recherchez votre ressource',
      texte:
        "Filtrez par matière, filière ou année d'examen pour cibler exactement le cours ou le sujet désiré.",
      pastilles: [{ libelle: 'Filières' }, { libelle: 'Sessions 2018-2025' }],
      tonPastilles: 'accent'
    },
    {
      numero: '03',
      ton: 'accent',
      titre: 'Consultez et révisez',
      texte:
        'Lisez instantanément sur notre lecteur interactif ou téléchargez le PDF pour travailler où que vous soyez.',
      // HORS MVP — « Lecture hors-ligne » et « Annotations » : mentions visuelles seulement.
      pastilles: [{ libelle: 'Lecture hors-ligne' }, { libelle: 'Annotations' }],
      tonPastilles: 'success'
    }
  ]
};

export const APPEL_A_L_ACTION = {
  badge: "Rejoignez l'élite académique",
  titre: 'Prêt à optimiser votre parcours académique ?',
  texte:
    "Rejoignez des dizaines de milliers d'étudiants et enseignants qui accèdent quotidiennement aux meilleures annales et supports de cours vérifiés.",
  bouton: { libelle: 'Commencer maintenant', to: cheminRecherche() }
};
