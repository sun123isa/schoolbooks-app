// =============================================================================
// Socle frontend — contenu de l'en-tête et du pied de page
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Textes séparés de la présentation : modifier les libellés ici uniquement.
// Un lien sans `to` est INACTIF (page non prévue au MVP) : il est affiché via
// <InactiveLink>. Lui donner un `to` suffit à l'activer.
// =============================================================================
import { ROUTES, cheminRecherche } from '../../app/routes.js';

// Ancre de la section « À propos » de la landing page (identifiant HTML).
export const ANCRE_A_PROPOS = 'a-propos';

// `page: true` : lien vers une page (état actif souligné). Les autres liens
// pointent vers une recherche pré-filtrée et ne sont jamais « actifs ».
// « À propos » n'est plus dans la barre : il reste accessible depuis le hero et
// le pied de page.
export const NAVIGATION = [
  { libelle: 'Accueil', to: ROUTES.accueil, end: true, page: true },
  { libelle: 'Ressources', to: ROUTES.recherche, page: true },
  { libelle: "Sujets d'examens", to: cheminRecherche({ type: 'sujet-examen' }) },
  { libelle: 'Livres', to: cheminRecherche({ type: 'livre' }) },
  { libelle: 'Supports de cours', to: cheminRecherche({ type: 'cours' }) }
];

export const ENTETE = {
  rechercher: 'Rechercher une ressource',
  explorer: 'Explorer les ressources',
  ouvrirMenu: 'Ouvrir le menu',
  fermerMenu: 'Fermer le menu'
};

export const PIED_DE_PAGE = {
  description:
    "ScolaRead réunit les sujets d'examens, livres et supports pédagogiques des lycéens et des étudiants, classés par niveau, série ou filière, matière et année.",
  colonnes: [
    {
      titre: 'Ressources',
      liens: [
        { libelle: 'Toutes les ressources', to: cheminRecherche() },
        { libelle: "Sujets d'examens", to: cheminRecherche({ type: 'sujet-examen' }) },
        { libelle: "Corrigés d'examens", to: cheminRecherche({ type: 'corrige' }) },
        { libelle: 'Livres', to: cheminRecherche({ type: 'livre' }) },
        { libelle: 'Supports de cours', to: cheminRecherche({ type: 'cours' }) }
      ]
    },
    {
      titre: 'Par niveau',
      liens: [
        { libelle: 'Lycée', to: cheminRecherche({ niveau: 'lycee' }) },
        { libelle: 'Université', to: cheminRecherche({ niveau: 'universite' }) },
        { libelle: 'Ajoutées récemment', to: cheminRecherche({ tri: 'recent' }) }
      ]
    },
    {
      titre: 'Informations',
      liens: [
        { libelle: 'À propos', to: `${ROUTES.accueil}#${ANCRE_A_PROPOS}` },
        { libelle: "Conditions d'utilisation" }, // LIEN INACTIF — page à rédiger
        { libelle: 'Mentions légales' } // LIEN INACTIF — page à rédiger
      ]
    }
  ],
  // BR10 — respect des droits d'utilisation des documents.
  droits:
    "Chaque document est diffusé dans le respect des droits de ses auteurs : les conditions d'utilisation sont indiquées sur sa fiche, et le téléchargement n'est proposé que lorsqu'il est autorisé.",
  copyright: `© ${new Date().getFullYear()} ScolaRead. Tous droits réservés.`
};
