// =============================================================================
// Page de consultation — route « /ressources/:id »
// Responsable : Karene MOUSSOUNDA — relecture : Salem KONGOLO
// Implémentation : HIRWA Jean Baptiste (intérim), à reprendre par Karene.
// Tickets Jira : « Consulter la fiche d'une ressource »,
// « Télécharger uniquement les documents disponibles au téléchargement »
//
// En-tête (type, titre, métadonnées, téléchargement), visionneuse PDF et fiche.
//   - BR06 : PDF absent (disponible = false) ou illisible → message, la fiche
//     reste visible et « Télécharger » disparaît ;
//   - BR08 : « Télécharger » seulement si telechargeable et urls.telechargement ;
//   - RESSOURCE_INTROUVABLE (404) → message et lien vers la recherche.
// =============================================================================
import { useCallback, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeftIcon, DownloadSimpleIcon, EyeIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { ERROR_CODES } from '@schoolbooks/shared';
import { cheminRecherche, cheminRetourRecherche } from '../../app/routes.js';
import { useApi } from '../../shared/hooks/useApi.js';
import { EmptyState, ErrorMessage, Loader } from '../../shared/components/StatusMessages.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { IconeType } from '../../shared/components/ui/IconeType.jsx';
import { fetchRessource } from './ressource.api.js';
import { TEXTES, peutTelecharger } from './ressource.content.js';
import { FicheRessource } from './components/FicheRessource.jsx';
import { VisionneusePdf } from './components/VisionneusePdf.jsx';
import './components/ressource.css';

function EnTete({ ressource, telechargeable }) {
  const pastilles = [ressource.niveau.libelle, ressource.filiere?.libelle, ressource.matiere.libelle, ressource.annee]
    .filter(Boolean)
    .map(String);

  return (
    <header className="consultation__entete">
      <div className="consultation__intro">
        <span className="consultation__type">
          <span className="consultation__type-icone">
            <IconeType code={ressource.type.code} />
          </span>
          {ressource.type.libelle}
        </span>
        <h1 className="consultation__titre">{ressource.titre}</h1>
        <ul className="consultation__pastilles" aria-label="Classement">
          {pastilles.map((pastille, index) => (
            <li key={pastille} style={{ '--i': index }}>
              {pastille}
            </li>
          ))}
        </ul>
      </div>

      <div className="consultation__actions">
        {telechargeable ? (
          <a href={ressource.urls.telechargement} download className="btn btn--md btn--primary">
            <DownloadSimpleIcon className="btn__icon" weight="bold" aria-hidden="true" />
            <span>{TEXTES.telecharger}</span>
          </a>
        ) : (
          <p className="consultation__seule">
            <EyeIcon weight="bold" aria-hidden="true" />
            {TEXTES.consultationSeule}
          </p>
        )}
      </div>
    </header>
  );
}

export function RessourcePage() {
  const { id } = useParams();
  const location = useLocation();
  const ressource = useApi((signal) => fetchRessource(id, signal), [id]);
  // Échec de chargement du PDF signalé par la visionneuse (mémorisé par URL).
  const [fichierEnErreur, setFichierEnErreur] = useState(null);
  const data = ressource.data;
  const url = data?.urls.fichier;
  const pdfEnErreur = !data?.disponible || !url || fichierEnErreur === url;
  const signalerErreur = useCallback(() => setFichierEnErreur(url), [url]);

  return (
    <div className="consultation">
      <Link to={cheminRetourRecherche(location.state)} className="consultation__retour">
        <ArrowLeftIcon weight="bold" aria-hidden="true" />
        {TEXTES.retour}
      </Link>

      {ressource.isLoading && <Loader label={TEXTES.chargement} />}

      {ressource.error?.code === ERROR_CODES.RESSOURCE_INTROUVABLE && (
        <EmptyState
          titre={TEXTES.introuvable.titre}
          action={
            <Button to={cheminRecherche()} iconLeft={MagnifyingGlassIcon}>
              {TEXTES.introuvable.bouton}
            </Button>
          }
        >
          {TEXTES.introuvable.texte}
        </EmptyState>
      )}
      {ressource.error && ressource.error.code !== ERROR_CODES.RESSOURCE_INTROUVABLE && (
        <ErrorMessage error={ressource.error} onRetry={ressource.reload} />
      )}

      {data && (
        <article className="consultation__article">
          <EnTete ressource={data} telechargeable={peutTelecharger(data, pdfEnErreur)} />
          <div className="consultation__corps">
            <div className="consultation__lecture">
              {pdfEnErreur ? (
                <ErrorMessage message={TEXTES.fichierIndisponible} />
              ) : (
                <VisionneusePdf key={url} url={url} titre={data.titre} onErreur={signalerErreur} />
              )}
            </div>
            <FicheRessource ressource={data} />
          </div>
        </article>
      )}
    </div>
  );
}
