// =============================================================================
// Espace formateur — gabarit (barre latérale, barre du haut, contenu)
// Réservé aux formateurs : visiteur → connexion formateur ; apprenant → message.
// Les livres du formateur sont chargés une fois ici et partagés avec les pages
// (useOutletContext) : le compteur de la barre latérale reste à jour.
// =============================================================================
import { useEffect, useId, useRef, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArchiveIcon,
  BellIcon,
  BooksIcon,
  EnvelopeSimpleIcon,
  HouseIcon,
  ListIcon,
  LockKeyIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  QuestionIcon,
  SignOutIcon,
  SquaresFourIcon,
  XIcon
} from '@phosphor-icons/react';
import { ROLES } from '@schoolbooks/shared';
import { ROUTES, cheminConnexion } from '../../app/routes.js';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { useApi } from '../../shared/hooks/useApi.js';
import { Loader } from '../../shared/components/StatusMessages.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { LogoMark } from '../../shared/components/ui/Logo.jsx';
import { fetchMesLivres } from './formateur.api.js';
import { initiales, notifications } from './tableauDeBord.content.js';
import './dashboard.css';

// actif(chemin, filtre) : l'onglet « Livres désactivés » partage la page
// « Mes livres » (filtre dans l'URL), d'où un calcul explicite de l'état actif.
const MENU = [
  {
    libelle: 'Tableau de bord',
    to: ROUTES.tableauDeBord,
    icone: SquaresFourIcon,
    actif: (c) => c === ROUTES.tableauDeBord
  },
  {
    libelle: 'Mes livres',
    to: ROUTES.mesLivres,
    icone: BooksIcon,
    compteur: 'total',
    actif: (c, f) => c === ROUTES.mesLivres && f !== 'inactifs'
  },
  {
    libelle: 'Ajouter un livre',
    to: ROUTES.nouveauLivre,
    icone: PlusCircleIcon,
    actif: (c) => c === ROUTES.nouveauLivre
  },
  {
    libelle: 'Livres désactivés',
    to: `${ROUTES.mesLivres}?filtre=inactifs`,
    icone: ArchiveIcon,
    compteur: 'desactives',
    actif: (c, f) => c === ROUTES.mesLivres && f === 'inactifs'
  }
];

const SUR_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform ?? '');

function BarreLaterale({ compteurs, ouverte, onFermer, onDeconnexion }) {
  const location = useLocation();
  const filtre = new URLSearchParams(location.search).get('filtre');
  return (
    <aside
      className={`tdb-lateral ${ouverte ? 'tdb-lateral--ouverte' : ''}`}
      aria-label="Navigation de l'espace formateur"
    >
      <div className="tdb-lateral__haut">
        <Link to={ROUTES.tableauDeBord} className="tdb-marque" onClick={onFermer}>
          <LogoMark className="tdb-marque__logo" />
          ScolaRead
        </Link>
        <button type="button" className="tdb-lateral__fermer" onClick={onFermer} aria-label="Fermer le menu">
          <XIcon weight="bold" aria-hidden="true" />
        </button>
      </div>

      <p className="tdb-lateral__section">Menu</p>
      <ul className="tdb-menu">
        {MENU.map(({ libelle, to, icone: Icone, compteur, actif }) => {
          const estActif = actif(location.pathname, filtre);
          const nombre = compteur ? compteurs[compteur] : 0;
          return (
            <li key={libelle}>
              <Link
                to={to}
                className={`tdb-menu__lien ${estActif ? 'active' : ''}`}
                aria-current={estActif ? 'page' : undefined}
                onClick={onFermer}
              >
                <Icone className="tdb-menu__icone" weight="regular" aria-hidden="true" />
                <Icone className="tdb-menu__icone tdb-menu__icone--actif" weight="fill" aria-hidden="true" />
                <span>{libelle}</span>
                {nombre > 0 && <span className="tdb-menu__badge">{nombre > 99 ? '99+' : nombre}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="tdb-lateral__section">Général</p>
      <ul className="tdb-menu">
        <li>
          <Link to={ROUTES.accueil} className="tdb-menu__lien">
            <HouseIcon className="tdb-menu__icone" aria-hidden="true" />
            <span>Voir le site</span>
          </Link>
        </li>
        <li>
          <Link to={`${ROUTES.accueil}#a-propos`} className="tdb-menu__lien">
            <QuestionIcon className="tdb-menu__icone" aria-hidden="true" />
            <span>Aide</span>
          </Link>
        </li>
        <li>
          <button type="button" className="tdb-menu__lien" onClick={onDeconnexion}>
            <SignOutIcon className="tdb-menu__icone" aria-hidden="true" />
            <span>Déconnexion</span>
          </button>
        </li>
      </ul>

      <div className="tdb-promo tdb-ondes">
        <span className="tdb-promo__pastille" aria-hidden="true">
          <PlusCircleIcon weight="fill" />
        </span>
        <p className="tdb-promo__titre">
          Publiez un
          <br />
          nouveau livre
        </p>
        <p className="tdb-promo__texte">Partagez vos PDF en quelques clics</p>
        <Link to={ROUTES.nouveauLivre} className="tdb-promo__bouton" onClick={onFermer}>
          Ajouter
        </Link>
      </div>
    </aside>
  );
}

function Notifications({ messages }) {
  const [ouvert, setOuvert] = useState(false);
  const id = useId();
  const racine = useRef(null);

  useEffect(() => {
    if (!ouvert) return undefined;
    const fermer = (event) => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !racine.current?.contains(event.target))
        setOuvert(false);
    };
    document.addEventListener('mousedown', fermer);
    document.addEventListener('keydown', fermer);
    return () => {
      document.removeEventListener('mousedown', fermer);
      document.removeEventListener('keydown', fermer);
    };
  }, [ouvert]);

  return (
    <div className="tdb-notifs" ref={racine}>
      <button
        type="button"
        className="tdb-rond"
        aria-label={`Notifications (${messages.length})`}
        aria-expanded={ouvert}
        aria-controls={id}
        onClick={() => setOuvert((o) => !o)}
      >
        <BellIcon weight="regular" aria-hidden="true" />
        {messages.length > 0 && <span className="tdb-rond__point" aria-hidden="true" />}
      </button>
      {ouvert && (
        <div className="tdb-notifs__panneau" id={id} role="region" aria-label="Notifications">
          <p className="tdb-notifs__titre">Notifications</p>
          {messages.length === 0 ? (
            <p className="tdb-notifs__vide">Rien de nouveau pour le moment.</p>
          ) : (
            <ul>
              {messages.map((m) => (
                <li key={m.texte}>
                  <Link to={m.to} onClick={() => setOuvert(false)}>
                    {m.texte}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function BarreHaut({ utilisateur, messages, onMenu }) {
  const navigate = useNavigate();
  const champ = useRef(null);
  const [saisie, setSaisie] = useState('');

  // ⌘F / Ctrl+F : place le curseur dans la recherche de livres.
  useEffect(() => {
    const raccourci = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        champ.current?.focus();
      }
    };
    window.addEventListener('keydown', raccourci);
    return () => window.removeEventListener('keydown', raccourci);
  }, []);

  return (
    <header className="tdb-haut">
      <button type="button" className="tdb-rond tdb-haut__menu" onClick={onMenu} aria-label="Ouvrir le menu">
        <ListIcon weight="bold" aria-hidden="true" />
      </button>
      <form
        className="tdb-recherche"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(
            saisie.trim() ? `${ROUTES.mesLivres}?q=${encodeURIComponent(saisie.trim())}` : ROUTES.mesLivres
          );
        }}
      >
        <MagnifyingGlassIcon className="tdb-recherche__loupe" weight="bold" aria-hidden="true" />
        <input
          ref={champ}
          type="search"
          value={saisie}
          onChange={(event) => setSaisie(event.target.value)}
          placeholder="Rechercher un livre"
          aria-label="Rechercher parmi mes livres"
        />
        <kbd className="tdb-recherche__raccourci">{SUR_MAC ? '⌘ F' : 'Ctrl F'}</kbd>
      </form>

      <div className="tdb-haut__droite">
        <a className="tdb-rond" href="mailto:contact@scolaread.cg" aria-label="Contacter l'équipe ScolaRead">
          <EnvelopeSimpleIcon weight="regular" aria-hidden="true" />
        </a>
        <Notifications messages={messages} />
        <div className="tdb-profil">
          <span className="tdb-profil__avatar" aria-hidden="true">
            {initiales(utilisateur)}
          </span>
          <span className="tdb-profil__texte">
            <span className="tdb-profil__nom">
              {utilisateur.prenom} {utilisateur.nom}
            </span>
            <span className="tdb-profil__email">{utilisateur.email}</span>
          </span>
        </div>
      </div>
    </header>
  );
}

function EspaceFormateur({ utilisateur, deconnecter }) {
  const navigate = useNavigate();
  const mesLivres = useApi((signal) => fetchMesLivres(signal), []);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [dernieresDonnees, setDernieresDonnees] = useState(null);

  // Garde les dernières données pendant un rechargement (pas de clignotement).
  if (mesLivres.data && mesLivres.data !== dernieresDonnees) setDernieresDonnees(mesLivres.data);
  const donnees = mesLivres.data ?? dernieresDonnees;

  async function seDeconnecter() {
    await deconnecter();
    navigate(ROUTES.accueil);
  }

  return (
    <div className="tdb">
      <BarreLaterale
        compteurs={{
          total: donnees?.items.length ?? 0,
          desactives: donnees?.items.filter((l) => !l.actif).length ?? 0
        }}
        ouverte={menuOuvert}
        onFermer={() => setMenuOuvert(false)}
        onDeconnexion={seDeconnecter}
      />
      {menuOuvert && <div className="tdb-voile" onClick={() => setMenuOuvert(false)} aria-hidden="true" />}
      <div className="tdb-colonne">
        <BarreHaut
          utilisateur={utilisateur}
          messages={notifications(donnees?.items ?? [])}
          onMenu={() => setMenuOuvert(true)}
        />
        <main className="tdb-contenu" id="contenu">
          <Outlet context={{ mesLivres: { ...mesLivres, data: donnees }, utilisateur }} />
        </main>
      </div>
    </div>
  );
}

export function FormateurLayout() {
  const { utilisateur, pret, deconnecter } = useAuth();
  const location = useLocation();

  if (!pret) {
    return (
      <div className="tdb-centre">
        <Loader label="Vérification de votre session…" />
      </div>
    );
  }
  if (!utilisateur) {
    return (
      <Navigate
        to={cheminConnexion('formateur')}
        replace
        state={{ depuis: `${location.pathname}${location.search}` }}
      />
    );
  }
  if (utilisateur.role !== ROLES.formateur) {
    return (
      <div className="tdb-centre">
        <div className="tdb-carte tdb-refus">
          <LockKeyIcon weight="duotone" aria-hidden="true" />
          <h1>Espace réservé aux formateurs</h1>
          <p>Votre compte apprenant donne accès aux livres et documents, pas au tableau de bord.</p>
          <Button to={ROUTES.livres}>Parcourir les livres</Button>
        </div>
      </div>
    );
  }
  return <EspaceFormateur utilisateur={utilisateur} deconnecter={deconnecter} />;
}
