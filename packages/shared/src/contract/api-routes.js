// =============================================================================
// Contrat d'API — chemins des routes
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Périmètre : source unique des chemins appelés par le frontend et déclarés
// par le backend. Toute modification doit passer par une PR dédiée « contrat ».
// =============================================================================

// Préfixe commun à toutes les routes de l'API.
export const API_PREFIX = '/api';

// Chemins relatifs au préfixe /api.
// Les identifiants de référentiels sont des codes lisibles (ex : « lycee »,
// « serie-c ») pour que les URL de recherche restent partageables.
export const API_ROUTES = {
  sante: '/health',

  // Référentiels — Isaac LELO MAKAYA
  niveaux: '/niveaux',
  filieresDuNiveau: (codeNiveau) => `/niveaux/${encodeURIComponent(codeNiveau)}/filieres`,
  matieres: '/matieres',
  annees: '/annees',
  typesDocuments: '/types-documents',

  // Recherche — Salem KONGOLO
  recherche: '/ressources',

  // Ressources et fichiers — Emmanuel AYA
  ressource: (id) => `/ressources/${encodeURIComponent(id)}`,
  fichier: (id) => `/ressources/${encodeURIComponent(id)}/fichier`,
  telechargement: (id) => `/ressources/${encodeURIComponent(id)}/telechargement`,

  // Comptes et authentification (cookies HTTP-only)
  auth: {
    inscriptionApprenant: '/auth/register/learner',
    inscriptionFormateur: '/auth/register/trainer',
    connexion: '/auth/login',
    rafraichir: '/auth/refresh',
    moi: '/auth/me',
    deconnexion: '/auth/logout'
  },

  // Référentiels des livres (identifiants et codes)
  niveauxScolaires: '/school-levels',
  matieresLivres: '/subjects',

  // Livres
  livres: '/books',
  livre: (id) => `/books/${encodeURIComponent(id)}`,
  fichierLivre: (nomFichier) => `/uploads/books/${encodeURIComponent(nomFichier)}`,
  telechargementLivre: (id) => `/books/${encodeURIComponent(id)}/download`,

  // Espace formateur
  mesLivres: '/books/trainer/mine',
  livreFormateur: (id) => `/books/trainer/${encodeURIComponent(id)}`,
  restaurerLivre: (id) => `/books/trainer/${encodeURIComponent(id)}/restore`,
  supprimerLivre: (id) => `/books/trainer/${encodeURIComponent(id)}/permanent`
};
