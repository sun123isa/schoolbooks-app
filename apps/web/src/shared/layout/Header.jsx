// =============================================================================
// Socle frontend — en-tête fixe et navigation principale
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Ordinateur : logo | navigation centrale | actions. Mobile (< 960 px) : logo +
// bouton menu qui déplie la navigation et les actions.
// HORS MVP affichés sans fonctionnalité : icône favoris, « Se connecter ».
// =============================================================================
import { useEffect, useId, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, Bookmark, Menu, Search, X } from 'lucide-react';
import { cheminRecherche } from '../../app/routes.js';
import { Button } from '../components/ui/Button.jsx';
import { InactiveLink } from '../components/ui/InactiveLink.jsx';
import { Logo } from '../components/ui/Logo.jsx';
import { ENTETE, NAVIGATION } from './layout.content.js';

function Navigation({ onNavigate }) {
  return (
    <ul className="header__nav-list">
      {NAVIGATION.map((item) => (
        <li key={item.libelle}>
          {item.to ? (
            <NavLink to={item.to} end={item.end} className="header__nav-link" onClick={onNavigate}>
              {item.libelle}
            </NavLink>
          ) : (
            <InactiveLink className="header__nav-link">{item.libelle}</InactiveLink>
          )}
        </li>
      ))}
    </ul>
  );
}

function Actions({ onNavigate }) {
  return (
    <div className="header__actions">
      <Link to={cheminRecherche()} className="header__icon-btn" aria-label={ENTETE.rechercher} onClick={onNavigate}>
        <Search aria-hidden="true" />
      </Link>
      {/* HORS MVP — favoris : icône affichée, sans fonctionnalité. */}
      <InactiveLink className="header__icon-btn" raison={ENTETE.favoris}>
        <Bookmark aria-hidden="true" />
        <span className="visually-hidden">{ENTETE.favoris}</span>
      </InactiveLink>
      <span className="header__separator" aria-hidden="true" />
      {/* HORS MVP — connexion : pas de comptes au MVP. */}
      <InactiveLink className="header__login">{ENTETE.connexion}</InactiveLink>
      <Button to={cheminRecherche()} size="sm" iconRight={ArrowRight} onClick={onNavigate}>
        {ENTETE.explorer}
      </Button>
    </div>
  );
}

export function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const idMenu = useId();
  const fermer = () => setMenuOuvert(false);

  // Échap ferme le menu mobile.
  useEffect(() => {
    if (!menuOuvert) return undefined;
    const surTouche = (event) => event.key === 'Escape' && setMenuOuvert(false);
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [menuOuvert]);

  return (
    <header className={`header ${menuOuvert ? 'header--ouvert' : ''}`}>
      <div className="container header__inner">
        <Logo />

        <button
          type="button"
          className="header__burger"
          aria-expanded={menuOuvert}
          aria-controls={idMenu}
          aria-label={menuOuvert ? ENTETE.fermerMenu : ENTETE.ouvrirMenu}
          onClick={() => setMenuOuvert((ouvert) => !ouvert)}
        >
          {menuOuvert ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <div className="header__panel" id={idMenu}>
          <nav aria-label="Navigation principale" className="header__nav">
            <Navigation onNavigate={fermer} />
          </nav>
          <Actions onNavigate={fermer} />
        </div>
      </div>
    </header>
  );
}
