// =============================================================================
// Landing page — route « / »
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Ticket Jira : « Parcours utilisateur : accéder aux ressources adaptées »
// Assemble les sections ; chaque section est un composant de ./components/ et
// tout le contenu (textes, chiffres, liens) vient de ./landing.content.js.
// Route déclarée en pleine largeur (handle.pleineLargeur dans app/router.jsx).
// =============================================================================
import { APPEL_A_L_ACTION, ATOUTS, ETAPES, HERO } from './landing.content.js';
import { HeroSection } from './components/HeroSection.jsx';
import { FeaturesSection } from './components/FeaturesSection.jsx';
import { StepsSection } from './components/StepsSection.jsx';
import { CtaBanner } from './components/CtaBanner.jsx';

export function LandingPage() {
  return (
    <>
      <HeroSection contenu={HERO} />
      <FeaturesSection contenu={ATOUTS} />
      <StepsSection contenu={ETAPES} />
      <CtaBanner contenu={APPEL_A_L_ACTION} />
    </>
  );
}
