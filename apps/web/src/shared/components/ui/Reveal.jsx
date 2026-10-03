// =============================================================================
// Socle frontend — apparition discrète au défilement
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Le contenu est visible par défaut ; l'animation ne s'active que si le
// navigateur la permet (IntersectionObserver) et que l'utilisateur n'a pas
// demandé de réduire les animations.
// Usage : <Reveal as="section" delay={100}>…</Reveal>
// =============================================================================
import { useEffect, useRef, useState } from 'react';
import './ui.css';

const animationsAutorisees = () =>
  typeof window !== 'undefined' &&
  'IntersectionObserver' in window &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Reveal({ as: Element = 'div', delay = 0, className = '', children, ...rest }) {
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
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [etat]);

  return (
    <Element
      ref={ref}
      className={`reveal reveal--${etat} ${className}`.trim()}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Element>
  );
}
