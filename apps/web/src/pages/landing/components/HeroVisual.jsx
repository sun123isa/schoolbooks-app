// =============================================================================
// Landing page — visuel du hero (photo encadrée + trois éléments flottants)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// La photo est l'image principale de la page : chargée en priorité (pas de lazy).
// Les éléments flottants sont décoratifs mais lisibles (contenu de maquette).
// =============================================================================
import { CircleCheck, Files, GraduationCap } from 'lucide-react';

export function HeroVisual({ visuel }) {
  return (
    <div className="hero-visual">
      <div className="hero-visual__frame">
        <img
          src={visuel.image}
          alt={visuel.alt}
          width={visuel.largeur}
          height={visuel.hauteur}
          fetchPriority="high"
          decoding="async"
          className="hero-visual__image"
        />
      </div>

      <div className="hero-visual__card hero-visual__card--exam">
        <span className="hero-visual__exam-icon" aria-hidden="true">
          <Files />
        </span>
        <div>
          <p className="hero-visual__exam-label">{visuel.examen.surtitre}</p>
          <p className="hero-visual__card-title">{visuel.examen.titre}</p>
          <p className="hero-visual__exam-detail">
            <CircleCheck aria-hidden="true" />
            {visuel.examen.detail}
          </p>
        </div>
      </div>

      <p className="hero-visual__pill">
        <span className="hero-visual__dot" aria-hidden="true" />
        <CircleCheck aria-hidden="true" className="hero-visual__pill-icon" />
        {visuel.conformite}
      </p>

      <div className="hero-visual__card hero-visual__card--students">
        <span className="hero-visual__students-icon" aria-hidden="true">
          <GraduationCap />
        </span>
        <div>
          <p className="hero-visual__card-title">{visuel.etudiants.valeur}</p>
          <p className="hero-visual__students-detail">{visuel.etudiants.libelle}</p>
        </div>
      </div>
    </div>
  );
}
