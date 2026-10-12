// =============================================================================
// Socle frontend — chemins des pages
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Toujours construire les liens avec ces fonctions (jamais de chaîne en dur),
// pour qu'un changement de route ne casse pas les autres pages.
// =============================================================================

export const ROUTES = {
  accueil: '/', // Landing page — Jean Baptiste
  recherche: '/recherche', // Recherche — Graciel
  ressource: '/ressources/:id', // Consultation — Karene

  // Comptes
  connexion: '/connexion',
  inscription: '/inscription',

  // Livres des formateurs
  livres: '/livres',
  livre: '/livres/:id',

  // Espace formateur
  tableauDeBord: '/formateur',
  mesLivres: '/formateur/livres',
  nouveauLivre: '/formateur/livres/nouveau',
  modifierLivre: '/formateur/livres/:id/modifier'
};

export function cheminLivre(id) {
  return ROUTES.livre.replace(':id', encodeURIComponent(id));
}

export function cheminModifierLivre(id) {
  return ROUTES.modifierLivre.replace(':id', encodeURIComponent(id));
}

// /livres?q=…&niveau=…&matiere=…&page=…
export function cheminLivres(criteres = {}) {
  const params = new URLSearchParams();
  for (const [cle, valeur] of Object.entries(criteres)) {
    if (valeur !== undefined && valeur !== null && String(valeur) !== '') params.set(cle, String(valeur));
  }
  const qs = params.toString();
  return `${ROUTES.livres}${qs ? `?${qs}` : ''}`;
}

// Inscription avec un rôle pré-sélectionné : /inscription?role=formateur
export function cheminInscription(role) {
  return role ? `${ROUTES.inscription}?role=${encodeURIComponent(role)}` : ROUTES.inscription;
}

// /recherche?niveau=lycee&filiere=serie-c — mêmes noms de paramètres que l'API.
export function cheminRecherche(criteres = {}) {
  const params = new URLSearchParams();
  for (const [cle, valeur] of Object.entries(criteres)) {
    if (valeur !== undefined && valeur !== null && String(valeur) !== '') {
      params.set(cle, String(valeur));
    }
  }
  const qs = params.toString();
  return `${ROUTES.recherche}${qs ? `?${qs}` : ''}`;
}

// /ressources/:id — pour permettre le retour aux mêmes résultats, la page de
// recherche passe sa query string dans l'état de navigation :
//   <Link to={cheminRessource(id)} state={{ retour: location.search }}>
// et la page de consultation revient vers cheminRetourRecherche(location.state).
export function cheminRessource(id) {
  return ROUTES.ressource.replace(':id', encodeURIComponent(id));
}

// Lien « Retour aux résultats » : recherche d'origine si connue, sinon recherche vide.
export function cheminRetourRecherche(etatNavigation) {
  const retour = etatNavigation?.retour;
  return typeof retour === 'string' && retour.startsWith('?') ? `${ROUTES.recherche}${retour}` : ROUTES.recherche;
}

// Connexion avec un public pré-sélectionné : /connexion?role=formateur
export function cheminConnexion(role) {
  return role ? `${ROUTES.connexion}?role=${encodeURIComponent(role)}` : ROUTES.connexion;
}
