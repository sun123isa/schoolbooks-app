// =============================================================================
// Socle frontend — pied de page
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Quatre colonnes (logo, ressources, institutions, disponibilité) puis barre
// inférieure. Libellés dans layout.content.js ; liens sans page = InactiveLink.
// =============================================================================
import { Link } from 'react-router-dom';
import { FileText, Globe, Landmark } from 'lucide-react';
import { InactiveLink } from '../components/ui/InactiveLink.jsx';
import { Logo } from '../components/ui/Logo.jsx';
import { PIED_DE_PAGE } from './layout.content.js';

const ICONES_RESEAUX = { institution: Landmark, documents: FileText, langues: Globe };

function LienPied({ lien, className }) {
  return lien.to ? (
    <Link to={lien.to} className={className}>
      {lien.libelle}
    </Link>
  ) : (
    <InactiveLink className={className}>{lien.libelle}</InactiveLink>
  );
}

export function Footer() {
  const { description, reseaux, colonnes, disponibilite, copyright, liensBas } = PIED_DE_PAGE;

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p className="footer__description">{description}</p>
          <ul className="footer__icons">
            {reseaux.map(({ id, libelle }) => {
              const Icone = ICONES_RESEAUX[id];
              return (
                <li key={id}>
                  {/* LIEN INACTIF — destination à définir. */}
                  <InactiveLink className="footer__icon" raison={libelle}>
                    <Icone aria-hidden="true" />
                    <span className="visually-hidden">{libelle}</span>
                  </InactiveLink>
                </li>
              );
            })}
          </ul>
        </div>

        {colonnes.map((colonne) => (
          <nav key={colonne.titre} className="footer__column" aria-label={colonne.titre}>
            <h2 className="footer__title">{colonne.titre}</h2>
            <ul className="footer__links">
              {colonne.liens.map((lien) => (
                <li key={lien.libelle}>
                  <LienPied lien={lien} className="footer__link" />
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="footer__column">
          <h2 className="footer__title">{disponibilite.titre}</h2>
          <div className="footer__status">
            <p className="footer__status-label">
              <span className="footer__status-dot" aria-hidden="true" />
              {disponibilite.statut}
            </p>
            <p className="footer__status-detail">{disponibilite.detail}</p>
          </div>
          <p className="footer__lang-title">{disponibilite.languesTitre}</p>
          <p className="footer__lang">{disponibilite.langue}</p>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>{copyright}</p>
          <ul className="footer__bottom-links">
            {liensBas.map((lien) => (
              <li key={lien.libelle}>
                <LienPied lien={lien} className="footer__bottom-link" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
