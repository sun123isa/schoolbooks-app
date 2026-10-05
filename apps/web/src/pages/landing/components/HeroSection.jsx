// =============================================================================
// Landing page — hero (fond photo + voile vert, portrait à droite, titre, actions)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Contient le seul <h1> de la page. Les photos sont au-dessus de la ligne de
// flottaison : chargées tout de suite, le portrait en priorité.
// Animations d'entrée en CSS (hero.css) : chaque élément reçoit son rang `--i`
// pour l'apparition en cascade ; le titre apparaît mot par mot.
// =============================================================================
import { ArrowRightIcon, ExamIcon, FilePdfIcon, PlayIcon } from '@phosphor-icons/react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import './hero.css';

const ICONES_ETIQUETTES = { examen: ExamIcon, pdf: FilePdfIcon };
const rang = (i) => ({ '--i': i });

function TitreAnime({ texte, accent }) {
  const mots = texte.split(' ');
  return (
    <h1 id="hero-titre" className="hero__title">
      {mots.map((mot, index) => (
        <span key={`${mot}-${index}`} className="hero__mot" style={rang(index)}>
          {mot}{' '}
        </span>
      ))}
      <span className="hero__title-accent" style={rang(mots.length)}>
        {accent}
        <svg className="hero__souligne" viewBox="0 0 120 16" aria-hidden="true" focusable="false">
          <path d="M3 11c26-7 62-9 114-4" />
        </svg>
      </span>
    </h1>
  );
}

export function HeroSection({ contenu }) {
  const { fond, portrait, actions } = contenu;

  return (
    <section className="hero" aria-labelledby="hero-titre">
      <img src={fond.src} alt="" width={fond.largeur} height={fond.hauteur} decoding="async" className="hero__fond" />
      <img
        src={portrait.src}
        alt={portrait.alt}
        width={portrait.largeur}
        height={portrait.hauteur}
        fetchPriority="high"
        decoding="async"
        className="hero__portrait"
      />

      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__overline hero__entree" style={rang(0)}>
            {contenu.surtitre.map((mot) => (
              <span key={mot} className="hero__overline-item">
                {mot}
              </span>
            ))}
          </p>

          <TitreAnime texte={contenu.titre} accent={contenu.titreAccent} />

          <p className="hero__description hero__entree" style={rang(6)}>
            {contenu.description}
          </p>

          <div className="hero__actions hero__entree" style={rang(7)}>
            <Button to={actions.principale.to} iconRight={ArrowRightIcon}>
              {actions.principale.libelle}
            </Button>
            <a href={`#${actions.secondaire.ancre}`} className="btn btn--md btn--ghost-light hero__secondary">
              <span className="hero__play" aria-hidden="true">
                <PlayIcon weight="fill" />
              </span>
              <span>{actions.secondaire.libelle}</span>
            </a>
          </div>
        </div>

        {/* Éléments décoratifs : masqués aux lecteurs d'écran. */}
        <ul className="hero__etiquettes" aria-hidden="true">
          {contenu.etiquettes.map((etiquette, index) => {
            const Icone = ICONES_ETIQUETTES[etiquette.icone];
            return (
              <li key={etiquette.texte} className={`hero__etiquette hero__etiquette--${index + 1}`}>
                <span className="hero__etiquette-icone">
                  <Icone weight="duotone" />
                </span>
                {etiquette.texte}
              </li>
            );
          })}
        </ul>

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
