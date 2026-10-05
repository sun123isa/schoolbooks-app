// =============================================================================
// Landing page — bandeau final d'appel à l'action (photo + voile vert)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Photo décorative en arrière-plan (alt vide), chargement différé.
// Animations : photo en parallaxe, titre mot par mot, halo sur le bouton.
// =============================================================================
import { useRef } from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import { useParallaxe } from '../../../shared/hooks/useMouvement.js';
import './sections.css';

export function CtaBanner({ contenu }) {
  const refImage = useRef(null);
  useParallaxe(refImage, 0.1);

  return (
    <section className="cta" aria-labelledby="cta-titre">
      <img
        ref={refImage}
        src={contenu.image}
        alt=""
        width="1440"
        height="540"
        loading="lazy"
        decoding="async"
        className="cta__image"
      />
      <Reveal className="container cta__content">
        <h2 id="cta-titre" className="cta__title">
          {contenu.titre.split(' ').map((mot, index) => (
            <span key={`${mot}-${index}`} className="cta__mot" style={{ '--i': index }}>
              {mot}{' '}
            </span>
          ))}
        </h2>
        <p className="cta__text">{contenu.texte}</p>
        <Button to={contenu.bouton.to} iconRight={ArrowRightIcon} className="cta__button">
          {contenu.bouton.libelle}
        </Button>
      </Reveal>
    </section>
  );
}
