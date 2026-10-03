// =============================================================================
// Landing page — section « Tout ce dont vous avez besoin pour réussir »
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Trois cartes (photo + icône + badge, titre, texte, lien vers la recherche).
// Images sous la ligne de flottaison : chargement différé.
// =============================================================================
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BookOpenText, Download, Search } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import { SectionHeading } from './SectionHeading.jsx';
import './sections.css';

const ICONES = { recherche: Search, ressources: BookOpenText, telechargement: Download };

function CarteAtout({ carte }) {
  const Icone = ICONES[carte.id];
  return (
    <article className="feature-card">
      <div className="feature-card__media">
        <img src={carte.image} alt={carte.alt} width="640" height="360" loading="lazy" decoding="async" />
        <span className="feature-card__icon" aria-hidden="true">
          <Icone />
        </span>
        <Badge tone={carte.ton === 'accent' ? 'accent-solid' : 'primary'} className="feature-card__badge">
          {carte.badge}
        </Badge>
      </div>
      <div className="feature-card__body">
        <h3 className="feature-card__title">{carte.titre}</h3>
        <p className="feature-card__text">{carte.texte}</p>
        <Link to={carte.lien.to} className={`feature-card__link feature-card__link--${carte.ton}`}>
          {carte.lien.libelle}
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function FeaturesSection({ contenu }) {
  return (
    <section className="landing-section" aria-labelledby="atouts-titre">
      <div className="container">
        <Reveal>
          <SectionHeading
            id="atouts-titre"
            badge={
              <Badge tone="accent" icon={BadgeCheck} uppercase>
                {contenu.badge}
              </Badge>
            }
            titre={contenu.titre}
            sousTitre={contenu.sousTitre}
          />
        </Reveal>
        <ul className="feature-grid">
          {contenu.cartes.map((carte, index) => (
            <Reveal as="li" key={carte.id} delay={index * 100}>
              <CarteAtout carte={carte} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
