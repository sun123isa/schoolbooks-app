// =============================================================================
// Socle frontend — document réservé aux inscrits
// Affiché à la place de la visionneuse quand le visiteur n'est pas connecté :
// la fiche reste publique, la lecture et le téléchargement demandent un compte
// apprenant (gratuit). Après inscription ou connexion, retour à cette page.
//   <AccesReserve document={resumeDocument(ressource)} />
// =============================================================================
import { useLocation } from 'react-router-dom';
import { LockKeyIcon, SignInIcon, UserPlusIcon } from '@phosphor-icons/react';
import { cheminConnexion, cheminInscription } from '../../app/routes.js';
import { Button } from './ui/Button.jsx';
import './acces-reserve.css';

// Résumé transmis à la page d'inscription (affiché dans son visuel).
// eslint-disable-next-line react-refresh/only-export-components -- utilitaire lié au composant.
export function resumeDocument(element, titre = element.titre) {
  return {
    titre,
    type: element.type?.libelle ?? null,
    typeCode: element.type?.code ?? null,
    niveau: element.niveau?.libelle ?? null,
    matiere: element.matiere?.libelle ?? null,
    annee: element.annee ?? null,
    telechargeable: Boolean(element.telechargeable)
  };
}

export function AccesReserve({ document }) {
  const location = useLocation();
  const retour = {
    depuis: `${location.pathname}${location.search}`,
    titre: document.titre,
    document,
    retour: location.state?.retour
  };

  return (
    <section className="acces-reserve" aria-labelledby="titre-acces-reserve">
      <span className="acces-reserve__icone" aria-hidden="true">
        <LockKeyIcon weight="duotone" />
      </span>
      <h2 id="titre-acces-reserve" className="acces-reserve__titre">
        Créez votre compte pour lire ce document
      </h2>
      <p className="acces-reserve__texte">
        L’inscription est gratuite et ne prend qu’une minute. Elle vous donne accès à la lecture en ligne et au
        téléchargement des documents autorisés.
      </p>
      <div className="acces-reserve__actions">
        <Button to={cheminInscription()} state={retour} iconLeft={UserPlusIcon}>
          Créer mon compte gratuit
        </Button>
        <Button to={cheminConnexion()} state={retour} variant="outline" iconLeft={SignInIcon}>
          J’ai déjà un compte
        </Button>
      </div>
    </section>
  );
}
