// =============================================================================
// Socle frontend — animations liées au défilement
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Toutes les animations pilotées en JavaScript passent par ce module, pour
// respecter la préférence « réduire les animations » du système.
//   mouvementAutorise()            : true si l'on peut animer
//   useParallaxe(ref, amplitude)   : écrit --parallaxe (px) sur l'élément
//   useDefilement(seuil)           : true quand la page a défilé de `seuil` px
//   useProgressionDefilement(ref)  : écrit --progression (0 → 1) sur l'élément
// =============================================================================
import { useEffect, useState } from 'react';

export function mouvementAutorise() {
  return typeof window !== 'undefined' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// Abonnement au défilement limité à une mise à jour par image (requestAnimationFrame).
function surDefilement(miseAJour) {
  let demande = 0;
  const planifier = () => {
    if (!demande) {
      demande = requestAnimationFrame(() => {
        demande = 0;
        miseAJour();
      });
    }
  };
  miseAJour();
  window.addEventListener('scroll', planifier, { passive: true });
  window.addEventListener('resize', planifier);
  return () => {
    cancelAnimationFrame(demande);
    window.removeEventListener('scroll', planifier);
    window.removeEventListener('resize', planifier);
  };
}

// Décalage vertical selon la position de l'élément dans la fenêtre, borné à
// ± amplitude × sa hauteur : l'élément doit dépasser de son cadre d'au moins
// autant (ex. image haute de 124 % décalée de -12 % → amplitude ≤ 0,09).
// À utiliser en CSS : transform: translateY(var(--parallaxe, 0px)).
export function useParallaxe(ref, amplitude = 0.08) {
  useEffect(() => {
    const element = ref.current;
    if (!element || !mouvementAutorise()) return undefined;
    return surDefilement(() => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const course = window.innerHeight / 2 + rect.height / 2;
      const position = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - window.innerHeight / 2) / course));
      element.style.setProperty('--parallaxe', `${(-position * amplitude * rect.height).toFixed(1)}px`);
    });
  }, [ref, amplitude]);
}

export function useDefilement(seuil = 8) {
  const [defile, setDefile] = useState(false);
  useEffect(() => surDefilement(() => setDefile(window.scrollY > seuil)), [seuil]);
  return defile;
}

// Progression de lecture de la page, de 0 (haut) à 1 (bas).
export function useProgressionDefilement(ref) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    return surDefilement(() => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      element.style.setProperty('--progression', total > 0 ? (window.scrollY / total).toFixed(4) : '0');
    });
  }, [ref]);
}
