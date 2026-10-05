// =============================================================================
// Landing page — route « / »
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Ticket Jira : « Parcours utilisateur : accéder aux ressources adaptées »
// Assemble les sections ; chaque section est un composant de ./components/ et
// tout le contenu (textes, chiffres, liens) vient de ./landing.content.js.
// Route déclarée en pleine largeur (handle.pleineLargeur dans app/router.jsx).
// =============================================================================
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { A_PROPOS, APPEL_A_L_ACTION, CHIFFRES, HERO, NOUVEAUTES, RESSOURCES } from './landing.content.js';
import { HeroSection } from './components/HeroSection.jsx';
import { ChiffresCles } from './components/ChiffresCles.jsx';
import { RessourcesSection } from './components/RessourcesSection.jsx';
import { AProposSection } from './components/AProposSection.jsx';
import { NouveautesSection } from './components/NouveautesSection.jsx';
import { CtaBanner } from './components/CtaBanner.jsx';

// Liens « /#a-propos » (en-tête, pied de page) : React Router ne fait pas
// défiler vers l'ancre, on le fait ici et on y place le focus clavier.
function useDefilementVersAncre() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const cible = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!cible) return;
    cible.scrollIntoView();
    cible.focus({ preventScroll: true });
  }, [hash]);
}

export function LandingPage() {
  useDefilementVersAncre();

  return (
    <>
      <HeroSection contenu={HERO} />
      <ChiffresCles contenu={CHIFFRES} />
      <RessourcesSection contenu={RESSOURCES} />
      <AProposSection contenu={A_PROPOS} />
      <NouveautesSection contenu={NOUVEAUTES} />
      <CtaBanner contenu={APPEL_A_L_ACTION} />
    </>
  );
}
