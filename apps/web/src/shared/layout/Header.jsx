// =============================================================================
// Socle frontend — en-tête fixe et navigation principale
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Ordinateur : logo | navigation centrale | recherche + bouton principal.
// Tablette et mobile (< 1080 px) : logo + bouton menu qui déplie la navigation.
// Une ombre apparaît dès que la page défile (useDefilement).
// =============================================================================
import { useEffect, useId, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRightIcon, ListIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { cheminRecherche } from '../../app/routes.js';
import { useDefilement } from '../hooks/useMouvement.js';
import { Button } from '../components/ui/Button.jsx';
import { InactiveLink } from '../components/ui/InactiveLink.jsx';
import { Logo } from '../components/ui/Logo.jsx';
import { ENTETE, NAVIGATION } from './layout.content.js';

function LienNavigation({ item, onNavigate }) {
  if (!item.to) return <InactiveLink className="header__nav-link">{item.libelle}</InactiveLink>;
  if (item.page) {
    return (
      <NavLink to={item.to} end={item.end} className="header__nav-link" onClick={onNavigate}>
        {item.libelle}
      </NavLink>
    );
  }
  return (
    <Link to={item.to} className="header__nav-link" onClick={onNavigate}>
      {item.libelle}
    </Link>
  );
}

export function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const idMenu = useId();
  const defile = useDefilement();
  const fermer = () => setMenuOuvert(false);

  // Échap ferme le menu mobile.
  useEffect(() => {
    if (!menuOuvert) return undefined;
    const surTouche = (event) => event.key === 'Escape' && setMenuOuvert(false);
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [menuOuvert]);

  return (
    <header className={`header ${menuOuvert ? 'header--ouvert' : ''} ${defile ? 'header--defile' : ''}`}>
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
          {menuOuvert ? <XIcon weight="bold" aria-hidden="true" /> : <ListIcon weight="bold" aria-hidden="true" />}
        </button>

        <div className="header__panel" id={idMenu}>
          <nav aria-label="Navigation principale" className="header__nav">
            <ul className="header__nav-list">
              {NAVIGATION.map((item) => (
                <li key={item.libelle}>
                  <LienNavigation item={item} onNavigate={fermer} />
                </li>
              ))}
            </ul>
          </nav>
          <div className="header__actions">
            <Link to={cheminRecherche()} className="header__icon-btn" aria-label={ENTETE.rechercher} onClick={fermer}>
              <MagnifyingGlassIcon weight="bold" aria-hidden="true" />
            </Link>
            <Button to={cheminRecherche()} size="sm" iconRight={ArrowRightIcon} onClick={fermer}>
              {ENTETE.explorer}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
