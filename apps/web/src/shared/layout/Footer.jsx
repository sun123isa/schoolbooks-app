// =============================================================================
// Socle frontend — pied de page (fond vert foncé)
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Colonne marque (logo, description) + colonnes de liens, puis barre inférieure
// avec la mention des droits d'utilisation (BR10). Libellés : layout.content.js.
// =============================================================================
import { Link } from 'react-router-dom';
import { InactiveLink } from '../components/ui/InactiveLink.jsx';
import { Logo } from '../components/ui/Logo.jsx';
import { PIED_DE_PAGE } from './layout.content.js';

export function Footer() {
  const { description, colonnes, droits, copyright } = PIED_DE_PAGE;

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo clair />
          <p className="footer__description">{description}</p>
        </div>

        {colonnes.map((colonne) => (
          <nav key={colonne.titre} className="footer__column" aria-label={colonne.titre}>
            <h2 className="footer__title">{colonne.titre}</h2>
            <ul className="footer__links">
              {colonne.liens.map((lien) => (
                <li key={lien.libelle}>
                  {lien.to ? (
                    <Link to={lien.to} className="footer__link">
                      {lien.libelle}
                    </Link>
                  ) : (
                    <InactiveLink className="footer__link">{lien.libelle}</InactiveLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__rights">{droits}</p>
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
