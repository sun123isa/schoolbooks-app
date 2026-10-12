// =============================================================================
// Socle frontend — gabarit commun à toutes les pages (en-tête, contenu, pied de page)
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Par défaut, le contenu est centré et espacé (pages recherche et consultation).
// Une route peut déclarer `handle: { pleineLargeur: true }` dans router.jsx
// pour gérer elle-même ses sections pleine largeur (landing page).
// =============================================================================
import { Outlet, useMatches } from 'react-router-dom';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import './layout.css';

export function Layout() {
  const pleineLargeur = useMatches().some((match) => match.handle?.pleineLargeur);

  return (
    <div className="layout">
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <Header />
      <main className={pleineLargeur ? 'layout__main' : 'layout__main layout__main--centre container'} id="contenu" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
