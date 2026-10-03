// =============================================================================
// Socle frontend — contenu de l'en-tête et du pied de page
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Textes séparés de la présentation : modifier les libellés ici uniquement.
// Un lien sans `to` est INACTIF (page non prévue au MVP) : il est affiché via
// <InactiveLink>. Lui donner un `to` suffit à l'activer.
// =============================================================================
import { ROUTES, cheminRecherche } from '../../app/routes.js';

export const NAVIGATION = [
  { libelle: 'Accueil', to: ROUTES.accueil, end: true },
  { libelle: 'Ressources', to: ROUTES.recherche },
  { libelle: 'Catégories' }, // LIEN INACTIF — pas de page catégories au MVP
  { libelle: 'À propos' } // LIEN INACTIF — pas de page « À propos » au MVP
];

export const ENTETE = {
  rechercher: 'Rechercher une ressource',
  favoris: 'Favoris (bientôt disponible)', // HORS MVP — aucune fonctionnalité
  connexion: 'Se connecter', // HORS MVP — pas de comptes
  explorer: 'Explorer les ressources',
  ouvrirMenu: 'Ouvrir le menu',
  fermerMenu: 'Fermer le menu'
};

export const PIED_DE_PAGE = {
  description:
    "Bibliothèque Académique Numérique Panafricaine. Plateforme dédiée à la diffusion du savoir, aux annales d'examens d'État et aux ressources universitaires en libre accès.",
  // Icônes décoratives de la colonne logo (LIENS INACTIFS).
  reseaux: [
    { id: 'institution', libelle: 'Institutions partenaires' },
    { id: 'documents', libelle: 'Documentation' },
    { id: 'langues', libelle: 'Langues' }
  ],
  colonnes: [
    {
      titre: 'Ressources & Programmes',
      liens: [
        { libelle: 'Catalogue des Ressources', to: cheminRecherche() },
        { libelle: 'Programmes Nationaux' }, // LIEN INACTIF
        { libelle: "Annales d'Examens (BAC, Brevet)", to: cheminRecherche({ type: 'sujet-examen' }) },
        { libelle: 'Fascicules de Cours & TD', to: cheminRecherche({ type: 'cours' }) },
        { libelle: 'Thèses et Mémoires de Recherche' } // LIEN INACTIF
      ]
    },
    {
      titre: 'Institutions Partenaires',
      liens: [
        { libelle: "Politique d'Accès Libre" }, // LIEN INACTIF
        { libelle: 'Espace Enseignants & Chercheurs' }, // LIEN INACTIF
        { libelle: 'Conseil Scientifique Panafricain' }, // LIEN INACTIF
        { libelle: "Conditions d'Utilisation" }, // LIEN INACTIF
        { libelle: 'Aide & Support Technique' } // LIEN INACTIF
      ]
    }
  ],
  disponibilite: {
    titre: 'Disponibilité',
    statut: 'Services en ligne 24/7',
    detail: 'Accès instantané aux serveurs universitaires.',
    languesTitre: 'Langues',
    langue: 'Français (Afrique Centrale & Ouest)'
  },
  copyright: '© 2025 ScolaRead. Bibliothèque Académique Numérique Panafricaine. Tous droits réservés.',
  liensBas: [
    { libelle: 'Catalogue', to: cheminRecherche() },
    { libelle: 'Programmes' }, // LIEN INACTIF
    { libelle: 'Annales', to: cheminRecherche({ type: 'sujet-examen' }) },
    { libelle: 'Accès Libre' }, // LIEN INACTIF
    { libelle: 'Conditions' }, // LIEN INACTIF
    { libelle: 'Support' } // LIEN INACTIF
  ]
};
