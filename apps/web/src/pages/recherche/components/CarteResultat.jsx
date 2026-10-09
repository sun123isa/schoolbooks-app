// =============================================================================
// Page de recherche — carte d'un résultat
// Responsable : Graciel MBEMBA — relecture : Salem KONGOLO
// Carte résumée : type et année, titre (2 lignes au plus), une ligne
// « niveau · série · matière », accès (téléchargeable ou en ligne).
// Toute la carte mène à la fiche, avec l'état `retour` (recherche d'origine)
// attendu par la page de consultation.
// =============================================================================
import { Link } from 'react-router-dom';
import { ArrowRightIcon, DownloadSimpleIcon, EyeIcon } from '@phosphor-icons/react';
import { cheminRessource } from '../../../app/routes.js';
import { IconeType } from '../../../shared/components/ui/IconeType.jsx';
import { filiereCourte, titreRessource } from '../../../shared/format/libelles.js';
import { TEXTES } from '../recherche.content.js';

export function CarteResultat({ ressource, retour }) {
  const T = TEXTES.carte;
  const classement = [ressource.niveau.libelle, filiereCourte(ressource.filiere?.libelle) ?? T.toutesSeries, ressource.matiere.libelle];

  return (
    <article className={`resultat resultat--${ressource.type.code}`}>
      <div className="resultat__haut">
        <span className="resultat__type">
          <span className="resultat__type-icone">
            <IconeType code={ressource.type.code} />
          </span>
          {ressource.type.libelle}
        </span>
        {ressource.annee && <span className="resultat__annee">{ressource.annee}</span>}
      </div>

      <h3 className="resultat__titre">
        <Link to={cheminRessource(ressource.id)} state={{ retour }} className="resultat__lien">
          {titreRessource(ressource.titre)}
        </Link>
      </h3>

      <p className="resultat__meta" title={classement.join(' · ')}>
        <span className="visually-hidden">Classement : </span>
        {classement.join(' · ')}
      </p>

      <div className="resultat__bas">
        {ressource.telechargeable ? (
          <span className="resultat__acces resultat__acces--telechargeable">
            <DownloadSimpleIcon weight="bold" aria-hidden="true" />
            {T.telechargeable}
          </span>
        ) : (
          <span className="resultat__acces">
            <EyeIcon weight="bold" aria-hidden="true" />
            {T.consultation}
          </span>
        )}
        <ArrowRightIcon className="resultat__fleche" weight="bold" aria-hidden="true" />
      </div>
    </article>
  );
}

export function CarteSquelette() {
  return (
    <div className="resultat resultat--squelette" aria-hidden="true">
      <span className="squelette squelette--pastille" />
      <span className="squelette squelette--titre" />
      <span className="squelette squelette--moyen" />
      <span className="squelette squelette--court" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Note : Graciel MBEMBA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
