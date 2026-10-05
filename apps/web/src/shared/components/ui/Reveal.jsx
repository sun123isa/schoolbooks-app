// =============================================================================
// Socle frontend — apparition au défilement
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Le contenu est visible par défaut ; l'animation ne s'active que si le
// navigateur la permet (IntersectionObserver) et que l'utilisateur n'a pas
// demandé de réduire les animations.
// Effets : monter (défaut), gauche, droite, zoom, devoiler (rideau).
// Les enfants peuvent s'animer à leur tour avec le sélecteur CSS
// `.reveal--visible .mon-element` (voir ui.css, classe `.cascade`).
// Usage : <Reveal as="section" effet="gauche" delay={100}>…</Reveal>
// =============================================================================
import { useEffect, useRef, useState } from 'react';
import { mouvementAutorise } from '../../hooks/useMouvement.js';
import './ui.css';

const animationsAutorisees = () => mouvementAutorise() && 'IntersectionObserver' in window;

export function Reveal({ as: Element = 'div', effet = 'monter', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null);
  // 'statique' : pas d'animation ; 'cache' : en attente ; 'visible' : animé.
  const [etat, setEtat] = useState(() => (animationsAutorisees() ? 'cache' : 'statique'));

  useEffect(() => {
    if (etat !== 'cache' || !ref.current) return undefined;
    const observer = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          setEtat('visible');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [etat]);

  return (
    <Element
      ref={ref}
      className={`reveal reveal--${etat} reveal--${effet} ${className}`.trim()}
      style={delay ? { ...style, '--reveal-delay': `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Element>
  );
}
