// =============================================================================
// Socle frontend — logo ScolaRead (écusson + livre ouvert, nom, mention)
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Logo dessiné en SVG en attendant le fichier officiel de la marque.
// Variante `clair` pour les fonds sombres (pied de page).
// =============================================================================
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../app/routes.js';
import './ui.css';

function LogoMark() {
  return (
    <svg className="logo__mark" viewBox="0 0 34 38" aria-hidden="true" focusable="false">
      <path d="M17 1 3 6v12c0 9.2 6 15.8 14 19 8-3.2 14-9.8 14-19V6L17 1Z" fill="var(--color-primary)" />
      <path d="M17 4.2 6 8.1v9.8c0 7.4 4.6 12.8 11 15.7 6.4-2.9 11-8.3 11-15.7V8.1L17 4.2Z" fill="var(--color-primary-light)" />
      <path d="M17 14.5c-2.6-1.6-5.6-2-8.5-1.6v10.4c2.9-.3 5.9.1 8.5 1.6V14.5Z" fill="var(--color-on-primary)" />
      <path d="M17 14.5c2.6-1.6 5.6-2 8.5-1.6v10.4c-2.9-.3-5.9.1-8.5 1.6V14.5Z" fill="var(--color-on-primary-muted)" />
    </svg>
  );
}

export function Logo({ clair = false, className = '' }) {
  return (
    <Link
      to={ROUTES.accueil}
      className={`logo ${clair ? 'logo--clair' : ''} ${className}`.trim()}
      aria-label="ScolaRead, accueil"
    >
      <LogoMark />
      <span className="logo__text">
        <span className="logo__name">ScolaRead</span>
        <span className="logo__tagline">Bibliothèque</span>
      </span>
    </Link>
  );
}
