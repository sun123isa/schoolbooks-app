// =============================================================================
// Page « /livres/:id » — fiche d'un livre, lecture du PDF, téléchargement
//   - visionneuse pdf.js (sans bouton natif de téléchargement) ;
//   - fiche publique ; lecture ET téléchargement réservés aux comptes connectés :
//     le visiteur est invité à créer un compte apprenant (gratuit) ;
//   - le compteur de téléchargements est rechargé après chaque téléchargement ;
//   - le formateur propriétaire voit aussi un livre désactivé, avec un raccourci
//     vers sa modification.
// =============================================================================
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BooksIcon,
  DownloadSimpleIcon,
  EyeIcon,
  PencilSimpleIcon,
  LockKeyIcon
} from '@phosphor-icons/react';
import { ERROR_CODES } from '@schoolbooks/shared';
import { ROUTES, cheminInscription, cheminModifierLivre } from '../../app/routes.js';
import { AccesReserve, resumeDocument } from '../../shared/components/AccesReserve.jsx';
import { useLectureProtegee } from '../../shared/hooks/useLectureProtegee.js';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { useApi } from '../../shared/hooks/useApi.js';
import { EmptyState, ErrorMessage, Loader } from '../../shared/components/StatusMessages.jsx';
import { Alerte } from '../../shared/components/ui/Formulaire.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { VisionneusePdf } from '../ressource/components/VisionneusePdf.jsx';
import { fetchLivre, telechargerLivre } from './livres.api.js';
import '../ressource/components/ressource.css';
import './livres.css';

const formatTaille = (octets) =>
  octets == null ? null : octets < 1024 * 1024 ? `${Math.max(1, Math.round(octets / 1024))} Ko` : `${(octets / 1024 / 1024).toFixed(1)} Mo`;
const formatDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

function Fiche({ livre }) {
  const lignes = [
    ['Auteur', livre.auteur],
    ['Publié par', livre.formateur?.nom],
    ['Niveau', livre.niveau.libelle],
    ['Série / filière', livre.filiere?.libelle],
    ['Matière', livre.matiere.libelle],
    ['Type', livre.type.libelle],
    ['Année', livre.annee],
    ['Taille', formatTaille(livre.tailleOctets)],
    ['Ajouté le', formatDate(livre.dateAjout)],
    ['Téléchargements', String(livre.telechargements)]
  ].filter(([, valeur]) => valeur !== null && valeur !== undefined && valeur !== '');

  return (
    <aside className="fiche-livre" aria-label="Informations sur le livre">
      {livre.description && <p className="fiche-livre__description">{livre.description}</p>}
      <dl className="fiche-livre__liste">
        {lignes.map(([terme, valeur]) => (
          <div key={terme}>
            <dt>{terme}</dt>
            <dd>{valeur}</dd>
          </div>
        ))}
      </dl>
      {livre.droits && (
        <p className="fiche-livre__droits">
          <strong>Droits d’utilisation : </strong>
          {livre.droits}
        </p>
      )}
    </aside>
  );
}

export function LivrePage() {
  const { id } = useParams();
  const location = useLocation();
  const { utilisateur } = useAuth();
  const livre = useApi((signal) => fetchLivre(id, signal), [id, utilisateur?.id]);
  const [telechargement, setTelechargement] = useState({ enCours: false, erreur: null });
  // Téléchargements effectués depuis cette page (le serveur a incrémenté son compteur).
  const [ajouts, setAjouts] = useState({ id, nombre: 0 });
  const data = livre.data;
  const url = data?.urls.fichier;
  const lecture = useLectureProtegee(url);
  const pdfEnErreur = !data?.disponible || !url || lecture.enErreur;

  async function telecharger() {
    setTelechargement({ enCours: true, erreur: null });
    try {
      await telechargerLivre(data.urls.telechargement);
      setTelechargement({ enCours: false, erreur: null });
      setAjouts((a) => ({ id, nombre: a.id === id ? a.nombre + 1 : 1 }));
    } catch (error) {
      setTelechargement({ enCours: false, erreur: error });
    }
  }

  return (
    <div className="consultation">
      <Link to={ROUTES.livres} className="consultation__retour">
        <ArrowLeftIcon weight="bold" aria-hidden="true" />
        Retour aux livres
      </Link>

      {livre.isLoading && <Loader label="Chargement du livre…" />}

      {livre.error?.code === ERROR_CODES.LIVRE_INTROUVABLE && (
        <EmptyState
          titre="Livre introuvable"
          icon={BooksIcon}
          action={<Button to={ROUTES.livres}>Parcourir les livres</Button>}
        >
          Ce livre n’existe pas ou n’est plus disponible.
        </EmptyState>
      )}
      {livre.error && livre.error.code !== ERROR_CODES.LIVRE_INTROUVABLE && (
        <ErrorMessage error={livre.error} onRetry={livre.reload} />
      )}

      {data && (
        <article className="consultation__article">
          <header className="consultation__entete">
            <div className="consultation__intro">
              <span className="consultation__type">
                <span className="consultation__type-icone">
                  <BooksIcon weight="duotone" aria-hidden="true" />
                </span>
                {data.type.libelle}
              </span>
              <h1 className="consultation__titre">{data.titre}</h1>
              <ul className="consultation__pastilles" aria-label="Classement">
                {[data.niveau.libelle, data.matiere.libelle, data.annee].filter(Boolean).map((p, index) => (
                  <li key={p} style={{ '--i': index }}>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="consultation__actions">
              {data.estProprietaire && (
                <Button to={cheminModifierLivre(data.id)} variant="outline" iconLeft={PencilSimpleIcon}>
                  Modifier
                </Button>
              )}
              {data.urls.telechargement && !pdfEnErreur ? (
                utilisateur ? (
                  <Button iconLeft={DownloadSimpleIcon} onClick={telecharger} disabled={telechargement.enCours}>
                    {telechargement.enCours ? 'Téléchargement…' : 'Télécharger le PDF'}
                  </Button>
                ) : (
                  <Button to={cheminInscription()} state={{ depuis: location.pathname, titre: data.titre, document: resumeDocument(data) }} iconLeft={LockKeyIcon} variant="outline">
                    S’inscrire pour télécharger
                  </Button>
                )
              ) : (
                <p className="consultation__seule">
                  <EyeIcon weight="bold" aria-hidden="true" />
                  Consultation en ligne uniquement
                </p>
              )}
            </div>
          </header>

          {!data.actif && (
            <Alerte>Ce livre est désactivé : il n’est visible que par vous. Restaurez-le depuis « Mes livres ».</Alerte>
          )}
          {telechargement.erreur && <Alerte>{telechargement.erreur.message}</Alerte>}

          <div className="consultation__corps">
            <div className="consultation__lecture">
              {!utilisateur ? (
                <AccesReserve document={resumeDocument(data)} />
              ) : pdfEnErreur ? (
                <ErrorMessage message="Le PDF de ce livre est momentanément inaccessible." />
              ) : (
                <VisionneusePdf key={lecture.cle} url={url} titre={data.titre} onErreur={lecture.signalerErreur} />
              )}
            </div>
            <Fiche livre={{ ...data, telechargements: data.telechargements + (ajouts.id === id ? ajouts.nombre : 0) }} />
          </div>
        </article>
      )}
    </div>
  );
}
