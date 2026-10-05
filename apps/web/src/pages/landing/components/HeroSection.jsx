// =============================================================================
// Landing page — hero (photo pleine largeur, voile vert, titre, actions)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Contient le seul <h1> de la page. La photo est l'image principale :
// chargée en priorité (fetchPriority="high", pas de lazy).
// =============================================================================
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import './hero.css';

export function HeroSection({ contenu }) {
  const { image, actions } = contenu;

  return (
    <section className="hero" aria-labelledby="hero-titre">
      <img
        src={image.src}
        alt={image.alt}
        width={image.largeur}
        height={image.hauteur}
        fetchPriority="high"
        decoding="async"
        className="hero__image"
      />

      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__overline">
            {contenu.surtitre.map((mot) => (
              <span key={mot} className="hero__overline-item">
                {mot}
              </span>
            ))}
          </p>

          <h1 id="hero-titre" className="hero__title">
            {contenu.titre} <span className="hero__title-accent">{contenu.titreAccent}</span>
          </h1>

          <p className="hero__description">{contenu.description}</p>

          <div className="hero__actions">
            <Button to={actions.principale.to} iconRight={ArrowRight}>
              {actions.principale.libelle}
            </Button>
            <a href={`#${actions.secondaire.ancre}`} className="btn btn--md btn--ghost-light hero__secondary">
              <span className="hero__play" aria-hidden="true">
                <Play />
              </span>
              <span>{actions.secondaire.libelle}</span>
            </a>
          </div>
        </div>

        {/* Annotation manuscrite décorative (masquée aux lecteurs d'écran et sur mobile). */}
        <p className="hero__annotation" aria-hidden="true">
          {contenu.annotation.map((ligne) => (
            <span key={ligne}>{ligne}</span>
          ))}
          <svg className="hero__annotation-arrow" viewBox="0 0 60 70" focusable="false">
            <path d="M48 4C58 30 40 52 10 60" />
            <path d="M22 50 9 60l15 5" />
          </svg>
        </p>
      </div>
    </section>
  );
}
