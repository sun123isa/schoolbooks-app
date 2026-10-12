// =============================================================================
// Pages de comptes — textes et règles de navigation
// =============================================================================
import { ROLES } from '@schoolbooks/shared';
import { ROUTES, cheminLivres } from '../../app/routes.js';

// Chemin interne au site uniquement : commence par « / », sans « // » initial ni
// barre oblique inverse (les navigateurs lisent « /\site.com » comme une autre
// origine), sans caractère de contrôle. Empêche toute redirection vers un autre site.
const BARRE_INVERSE = String.fromCharCode(92);

export function estCheminInterne(chemin) {
  if (typeof chemin !== 'string' || !chemin.startsWith('/')) return false;
  if (chemin.startsWith('//') || chemin.includes(BARRE_INVERSE)) return false;
  return ![...chemin].some((caractere) => caractere.charCodeAt(0) < 32);
}

// Page demandée avant la connexion (document, espace formateur), sinon page d'accueil du rôle.
export function destinationApresConnexion(utilisateur, etatNavigation) {
  const depuis = etatNavigation?.depuis;
  if (estCheminInterne(depuis)) return depuis;
  return utilisateur.role === ROLES.formateur ? ROUTES.tableauDeBord : ROUTES.livres;
}

// Carte de félicitations affichée après la création d'un compte (useCelebration).
// document : document que l'élève voulait ouvrir (inscription depuis un document).
export function celebrationInscription(utilisateur, document = null) {
  if (utilisateur.role === ROLES.formateur) {
    return {
      icone: 'compte',
      titre: `Bienvenue, ${utilisateur.prenom} !`,
      message:
        'Votre espace formateur est prêt. Publiez votre premier livre : il sera aussitôt visible par les élèves.',
      actions: [{ libelle: 'Publier mon premier livre', to: ROUTES.nouveauLivre }],
      fermer: 'Découvrir mon tableau de bord'
    };
  }
  if (document?.titre) {
    return {
      icone: 'compte',
      titre: `Bienvenue, ${utilisateur.prenom} !`,
      message: 'Votre compte est créé. Le document s’ouvre : bonne lecture et bonnes révisions !',
      element: document.titre,
      fermer: 'Commencer la lecture'
    };
  }
  return {
    icone: 'compte',
    titre: `Bienvenue, ${utilisateur.prenom} !`,
    message: 'Votre compte est créé. Lisez et téléchargez désormais tous les documents de votre niveau.',
    actions: [{ libelle: 'Parcourir les livres', to: cheminLivres() }],
    fermer: 'Continuer'
  };
}
