// =============================================================================
// Landing page — carte de recherche du hero (mot-clé + tendances)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Saisie → /recherche?q=… ; saisie vide → page de recherche sans critère.
// Tendances → recherche filtrée par matière.
// =============================================================================
import { useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextSearch } from 'lucide-react';
import { cheminRecherche } from '../../../app/routes.js';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { cheminRechercheMotCle } from '../landing.content.js';

export function HeroSearch({ contenu }) {
  const navigate = useNavigate();
  const idChamp = useId();

  const rechercher = (event) => {
    event.preventDefault();
    navigate(cheminRechercheMotCle(new FormData(event.currentTarget).get('q')));
  };

  return (
    <div className="hero-search">
      <form role="search" className="hero-search__form" onSubmit={rechercher}>
        <label htmlFor={idChamp} className="visually-hidden">
          {contenu.label}
        </label>
        <TextSearch className="hero-search__icon" aria-hidden="true" />
        <input
          id={idChamp}
          name="q"
          type="search"
          maxLength={100}
          autoComplete="off"
          placeholder={contenu.placeholder}
          className="hero-search__input"
        />
        <Button type="submit" size="sm">
          {contenu.bouton}
        </Button>
      </form>

      <div className="hero-search__trends">
        <span className="hero-search__trends-label" id={`${idChamp}-tendances`}>
          {contenu.tendancesLabel}
        </span>
        <ul className="hero-search__chips" aria-labelledby={`${idChamp}-tendances`}>
          {contenu.tendances.map((tendance) => (
            <li key={tendance.libelle}>
              <Link to={cheminRecherche(tendance.criteres)} className="chip">
                {tendance.libelle}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
