// =============================================================================
// Page « /formateur/livres » — gestion des livres du formateur
// Actions par livre : voir, modifier, désactiver / restaurer, supprimer
// définitivement (avec confirmation). Filtre : tous / actifs / désactivés.
// =============================================================================
import { useState } from 'react';
import { Link, useLocation, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  ArrowCounterClockwiseIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilSimpleIcon,
  PlusCircleIcon,
  TrashIcon
} from '@phosphor-icons/react';
import { ROUTES, cheminLivre, cheminModifierLivre } from '../../app/routes.js';
import { EmptyState, ErrorMessage, Loader } from '../../shared/components/StatusMessages.jsx';
import { Alerte } from '../../shared/components/ui/Formulaire.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { desactiverLivre, restaurerLivre, supprimerLivre } from './formateur.api.js';
import { ModaleSuppression } from './components/ModaleSuppression.jsx';
import './formateur.css';

const FILTRES = [
  { cle: 'tous', libelle: 'Tous' },
  { cle: 'actifs', libelle: 'Actifs' },
  { cle: 'inactifs', libelle: 'Désactivés' }
];

export function GestionLivresPage() {
  // Livres chargés par le gabarit : recharger met aussi à jour le compteur du menu.
  const { mesLivres } = useOutletContext();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const filtre = FILTRES.some((f) => f.cle === params.get('filtre')) ? params.get('filtre') : 'tous';
  const recherche = (params.get('q') ?? '').trim().toLowerCase();
  const [enCours, setEnCours] = useState(null); // id du livre en cours de traitement
  const [aSupprimer, setASupprimer] = useState(null); // livre dont la suppression est à confirmer
  // Message transmis après un ajout ou une modification (FormulaireLivrePage).
  const [message, setMessage] = useState(
    location.state?.message ? { type: 'succes', texte: location.state.message } : null
  );
  const setFiltre = (cle) => {
    const suivant = new URLSearchParams(params);
    if (cle === 'tous') suivant.delete('filtre');
    else suivant.set('filtre', cle);
    setParams(suivant, { replace: true });
  };

  async function agir(livre, action) {
    const actions = {
      desactiver: {
        appel: desactiverLivre,
        succes: `« ${livre.titre} » est désactivé : il n’apparaît plus dans le catalogue.`
      },
      restaurer: {
        appel: restaurerLivre,
        succes: `« ${livre.titre} » est de nouveau visible dans le catalogue.`
      },
      supprimer: {
        appel: supprimerLivre,
        succes: `« ${livre.titre} » a été supprimé définitivement.`
      }
    }[action];
    setEnCours(livre.id);
    setMessage(null);
    try {
      await actions.appel(livre.id);
      setMessage({ type: 'succes', texte: actions.succes });
      setASupprimer(null);
      mesLivres.reload();
    } catch (error) {
      // La modale se ferme pour que le message d'erreur soit visible.
      setASupprimer(null);
      setMessage({ type: 'erreur', texte: error.message });
    } finally {
      setEnCours(null);
    }
  }

  const tous = (mesLivres.data?.items ?? []).filter(
    (l) => !recherche || l.titre.toLowerCase().includes(recherche)
  );
  const livres = tous.filter((l) =>
    filtre === 'actifs' ? l.actif : filtre === 'inactifs' ? !l.actif : true
  );
  const nombre = {
    tous: tous.length,
    actifs: tous.filter((l) => l.actif).length,
    inactifs: tous.filter((l) => !l.actif).length
  };

  return (
    <div className="espace">
      <header className="espace__entete">
        <div>
          <p className="espace__surtitre">
            <Link to={ROUTES.tableauDeBord}>Espace formateur</Link>
          </p>
          <h1 className="espace__titre">Mes livres</h1>
        </div>
        <div className="espace__actions">
          <Button to={ROUTES.nouveauLivre} iconLeft={PlusCircleIcon}>
            Ajouter un livre
          </Button>
        </div>
      </header>

      {message && <Alerte type={message.type}>{message.texte}</Alerte>}

      {recherche && (
        <p className="espace__intro">
          Résultats pour « {params.get('q')} » · <Link to={ROUTES.mesLivres}>Effacer la recherche</Link>
        </p>
      )}

      {!mesLivres.data && !mesLivres.error && <Loader label="Chargement de vos livres…" />}
      {mesLivres.error && <ErrorMessage error={mesLivres.error} onRetry={mesLivres.reload} />}

      {mesLivres.data &&
        (tous.length === 0 && !recherche ? (
          <EmptyState
            titre="Aucun livre publié"
            action={
              <Button to={ROUTES.nouveauLivre} iconLeft={PlusCircleIcon}>
                Publier mon premier livre
              </Button>
            }
          >
            Ajoutez un PDF avec son niveau et sa matière : il apparaîtra dans le catalogue.
          </EmptyState>
        ) : (
          <>
            <div className="onglets" role="group" aria-label="Filtrer les livres">
              {FILTRES.map(({ cle, libelle }) => (
                <button key={cle} type="button" aria-pressed={filtre === cle} onClick={() => setFiltre(cle)}>
                  {libelle} <span>{nombre[cle]}</span>
                </button>
              ))}
            </div>

            <div className="table-defilante">
              <table className="table-livres">
                <thead>
                  <tr>
                    <th scope="col">Livre</th>
                    <th scope="col">Niveau · Matière</th>
                    <th scope="col">Téléchargements</th>
                    <th scope="col">Statut</th>
                    <th scope="col">
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {livres.map((livre) => {
                    const occupe = enCours === livre.id;
                    return (
                      <tr key={livre.id} className={livre.actif ? '' : 'table-livres__inactif'}>
                        <td>
                          <Link to={cheminLivre(livre.id)} className="table-livres__titre">
                            {livre.titre}
                          </Link>
                          <span className="table-livres__sous">
                            Ajouté le {new Date(livre.dateAjout).toLocaleDateString('fr-FR')}
                            {livre.telechargeable ? '' : ' · lecture seule'}
                          </span>
                        </td>
                        <td>
                          {livre.niveau.libelle} · {livre.matiere.libelle}
                        </td>
                        <td>{livre.telechargements}</td>
                        <td>
                          <span className={`statut ${livre.actif ? 'statut--actif' : 'statut--inactif'}`}>
                            {livre.actif ? 'Actif' : 'Désactivé'}
                          </span>
                        </td>
                        <td>
                          <div className="table-livres__actions">
                            <Link to={cheminLivre(livre.id)} className="action" title="Voir">
                              <EyeIcon weight="bold" aria-hidden="true" />
                              <span className="visually-hidden">Voir {livre.titre}</span>
                            </Link>
                            <Link to={cheminModifierLivre(livre.id)} className="action" title="Modifier">
                              <PencilSimpleIcon weight="bold" aria-hidden="true" />
                              <span className="visually-hidden">Modifier {livre.titre}</span>
                            </Link>
                            {livre.actif ? (
                              <button
                                type="button"
                                className="action"
                                title="Désactiver"
                                disabled={occupe}
                                onClick={() => agir(livre, 'desactiver')}
                              >
                                <EyeSlashIcon weight="bold" aria-hidden="true" />
                                <span className="visually-hidden">Désactiver {livre.titre}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="action"
                                title="Restaurer"
                                disabled={occupe}
                                onClick={() => agir(livre, 'restaurer')}
                              >
                                <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" />
                                <span className="visually-hidden">Restaurer {livre.titre}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="action action--danger"
                              title="Supprimer définitivement"
                              disabled={occupe}
                              onClick={() => setASupprimer(livre)}
                            >
                              <TrashIcon weight="bold" aria-hidden="true" />
                              <span className="visually-hidden">Supprimer définitivement {livre.titre}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {livres.length === 0 && <p className="table-livres__vide">Aucun livre dans cette catégorie.</p>}
            </div>
          </>
        ))}

      <ModaleSuppression
        livre={aSupprimer}
        enCours={Boolean(aSupprimer) && enCours === aSupprimer.id}
        onAnnuler={() => setASupprimer(null)}
        onConfirmer={() => agir(aSupprimer, 'supprimer')}
        onDesactiver={() => agir(aSupprimer, 'desactiver')}
      />
    </div>
  );
}
