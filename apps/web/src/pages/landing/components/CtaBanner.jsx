// =============================================================================
// Landing page — bandeau d'appel à l'action
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// =============================================================================
import { Download, Zap } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import './sections.css';

export function CtaBanner({ contenu }) {
  return (
    <section className="landing-section landing-section--cta" aria-labelledby="cta-titre">
      <div className="container">
        <Reveal className="cta">
          <div className="cta__content">
            <p className="cta__badge">
              <Zap aria-hidden="true" />
              {contenu.badge}
            </p>
            <h2 id="cta-titre" className="cta__title">
              {contenu.titre}
            </h2>
            <p className="cta__text">{contenu.texte}</p>
          </div>
          <Button to={contenu.bouton.to} variant="accent" iconLeft={Download} className="cta__button">
            {contenu.bouton.libelle}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
