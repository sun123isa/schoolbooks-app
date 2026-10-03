// =============================================================================
// Landing page — section hero (titre principal, actions, recherche, chiffres, visuel)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Contient le seul <h1> de la page.
// =============================================================================
import { BookOpenText, GraduationCap, Search } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { HeroSearch } from './HeroSearch.jsx';
import { HeroVisual } from './HeroVisual.jsx';
import './hero.css';

export function HeroSection({ contenu }) {
  return (
    <section className="hero" aria-labelledby="hero-titre">
      <div className="container hero__grid">
        <div className="hero__content">
          <Badge tone="outline" icon={GraduationCap} className="hero__badge">
            {contenu.badge}
          </Badge>

          <h1 id="hero-titre" className="hero__title">
            {contenu.titreDebut}
            <br />
            <span className="hero__title-accent">{contenu.titreAccent}</span>
            <span className="hero__title-dot">.</span>
          </h1>

          <p className="hero__description">{contenu.description}</p>

          <div className="hero__actions">
            <Button to={contenu.actions.trouver.to} iconLeft={Search}>
              {contenu.actions.trouver.libelle}
            </Button>
            <Button to={contenu.actions.catalogue.to} variant="outline" iconLeft={BookOpenText}>
              {contenu.actions.catalogue.libelle}
            </Button>
          </div>

          <HeroSearch contenu={contenu.recherche} />

          <dl className="hero__stats">
            {contenu.statistiques.map((stat) => (
              <div key={stat.libelle} className="hero__stat">
                <dt className="hero__stat-label">{stat.libelle}</dt>
                <dd className={`hero__stat-value ${stat.accent ? 'hero__stat-value--accent' : ''}`}>{stat.valeur}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroVisual visuel={contenu.visuel} />
      </div>
    </section>
  );
}
