// =============================================================================
// Socle frontend — logo ScolaRead (livre ouvert + nom + mention)
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Logo dessiné en SVG en attendant le fichier officiel de la marque.
// =============================================================================
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../app/routes.js';
import './ui.css';

function LogoMark() {
  return (
    <svg className="logo__mark" viewBox="0 0 40 32" aria-hidden="true" focusable="false">
      <path d="M20 7c-4-3-10-4-17-3v21c7-1 13 0 17 3V7Z" fill="var(--color-primary)" />
      <path d="M20 7c4-3 10-4 17-3v21c-7-1-13 0-17 3V7Z" fill="var(--color-primary-light)" />
      <path d="M20 7v21" stroke="var(--color-on-primary)" strokeWidth="1.2" />
      <path d="M26 4.5v9l3-2 3 2v-9.4c-2-.2-4-.1-6 .4Z" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ className = '' }) {
  return (
    <Link to={ROUTES.accueil} className={`logo ${className}`.trim()} aria-label="ScolaRead — accueil">
      <LogoMark />
      <span className="logo__text">
        <span className="logo__name">
          Scola<span className="logo__name-accent">Read</span>
        </span>
        <span className="logo__tagline">Bibliothèque académique</span>
      </span>
    </Link>
  );
}
