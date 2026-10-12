// =============================================================================
// Page de consultation — route « /ressources/:id »
// Responsable : Karene MOUSSOUNDA — relecture : Salem KONGOLO
// Tickets Jira : « Consulter la fiche d'une ressource »,
// « Télécharger uniquement les documents disponibles au téléchargement »
//
// En-tête (type, titre, métadonnées, téléchargement), visionneuse PDF et fiche.
//   - BR06 : PDF absent (disponible = false) ou illisible → message, la fiche
//     reste visible et « Télécharger » disparaît ;
//   - BR08 : « Télécharger » seulement si telechargeable et urls.telechargement ;
//   - RESSOURCE_INTROUVABLE (404) → message et lien vers la recherche ;
//   - fiche publique, document (lecture, téléchargement) réservé aux inscrits.
// =============================================================================

import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeftIcon, DownloadSimpleIcon, EyeIcon, LockKeyIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { ERROR_CODES } from '@schoolbooks/shared';
import { cheminInscription, cheminRecherche, cheminRetourRecherche } from '../../app/routes.js';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { AccesReserve, resumeDocument } from '../../shared/components/AccesReserve.jsx';
import { useLectureProtegee } from '../../shared/hooks/useLectureProtegee.js';
import { telechargerFichier } from '../../shared/api/telechargement.js';
import { useApi } from '../../shared/hooks/useApi.js';
import { EmptyState, ErrorMessage, Loader } from '../../shared/components/StatusMessages.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { IconeType } from '../../shared/components/ui/IconeType.jsx';
import { filiereCourte, titreRessource } from '../../shared/format/libelles.js';
import { fetchRessource } from './ressource.api.js';
import { TEXTES, peutTelecharger } from './ressource.content.js';
import { FicheRessource } from './components/FicheRessource.jsx';
import { VisionneusePdf } from './components/VisionneusePdf.jsx';
import './components/ressource.css';

// Téléchargement avec la session (renouvelée si besoin) ; erreur affichée sous le bouton.
function BoutonTelecharger({ url }) {
  const [etat, setEtat] = useState({ enCours: false, erreur: null });
  async function telecharger() {
    setEtat({ enCours: true, erreur: null });
    try {
      await telechargerFichier(url);
      setEtat({ enCours: false, erreur: null });
    } catch (error) {
      setEtat({ enCours: false, erreur: error });
    }
  }
  return (
    <>
      <Button iconLeft={DownloadSimpleIcon} onClick={telecharger} disabled={etat.enCours}>
        {etat.enCours ? 'Téléchargement…' : TEXTES.telecharger}
      </Button>
      {etat.erreur && <p className="consultation__erreur-telechargement">{etat.erreur.message}</p>}
    </>
  );
}

function EnTete({ ressource, telechargeable, connecte }) {
  const location = useLocation();
  const pastilles = [ressource.niveau.libelle, filiereCourte(ressource.filiere?.libelle), ressource.matiere.libelle, ressource.annee]
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
        <h1 className="consultation__titre">{titreRessource(ressource.titre)}</h1>
        <ul className="consultation__pastilles" aria-label="Classement">
          {pastilles.map((pastille, index) => (
            <li key={pastille} style={{ '--i': index }}>
              {pastille}
            </li>
          ))}
        </ul>
      </div>

      <div className="consultation__actions">
        {telechargeable && !connecte ? (
          <Button
            to={cheminInscription()}
            state={{
              depuis: location.pathname,
              titre: titreRessource(ressource.titre),
              document: resumeDocument(ressource, titreRessource(ressource.titre)),
              retour: location.state?.retour
            }}
            variant="outline"
            iconLeft={LockKeyIcon}
          >
            S’inscrire pour télécharger
          </Button>
        ) : telechargeable ? (
          <BoutonTelecharger url={ressource.urls.telechargement} />
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
  const { utilisateur } = useAuth();
  const ressource = useApi((signal) => fetchRessource(id, signal), [id]);
  const data = ressource.data;
  const url = data?.urls.fichier;
  // Lecture réservée aux comptes connectés ; session renouvelée une fois si besoin.
  const lecture = useLectureProtegee(url);
  const pdfEnErreur = !data?.disponible || !url || lecture.enErreur;

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
          <EnTete ressource={data} telechargeable={peutTelecharger(data, pdfEnErreur)} connecte={Boolean(utilisateur)} />
          <div className="consultation__corps">
            <div className="consultation__lecture">
              {!utilisateur && data.disponible ? (
                <AccesReserve document={resumeDocument(data, titreRessource(data.titre))} />
              ) : pdfEnErreur ? (
                <ErrorMessage message={TEXTES.fichierIndisponible} />
              ) : (
                <VisionneusePdf key={lecture.cle} url={url} titre={titreRessource(data.titre)} onErreur={lecture.signalerErreur} />
              )}
            </div>
            <FicheRessource ressource={data} />
          </div>
        </article>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Note : Karene MOUSSOUNDA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
