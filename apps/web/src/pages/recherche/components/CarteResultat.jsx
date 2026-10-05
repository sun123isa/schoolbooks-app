// =============================================================================
// Page de recherche — carte d'un résultat
// Responsable : Graciel MBEMBA — relecture : Salem KONGOLO
// Titre, type, niveau, série/filière, matière, année, badge « Téléchargeable ».
// Toute la carte mène à la fiche, avec l'état `retour` (recherche d'origine)
// attendu par la page de consultation.
// =============================================================================
import { Link } from 'react-router-dom';
import { ArrowRightIcon, DownloadSimpleIcon, EyeIcon } from '@phosphor-icons/react';
import { cheminRessource } from '../../../app/routes.js';
import { IconeType } from '../../../shared/components/ui/IconeType.jsx';
import { TEXTES } from '../recherche.content.js';

export function CarteResultat({ ressource, retour }) {
  const T = TEXTES.carte;
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
          {ressource.titre}
        </Link>
      </h3>

      <dl className="resultat__meta">
        <div>
          <dt className="visually-hidden">Niveau</dt>
          <dd>{ressource.niveau.libelle}</dd>
        </div>
        <div>
          <dt className="visually-hidden">Série / filière</dt>
          <dd>{ressource.filiere?.libelle ?? T.toutesSeries}</dd>
        </div>
        <div>
          <dt className="visually-hidden">Matière</dt>
          <dd>{ressource.matiere.libelle}</dd>
        </div>
      </dl>

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
        <span className="resultat__format">{ressource.format}</span>
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
