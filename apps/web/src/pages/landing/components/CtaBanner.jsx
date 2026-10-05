// =============================================================================
// Landing page — bandeau final d'appel à l'action (photo + voile vert)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Photo décorative en arrière-plan (alt vide), chargement différé.
// =============================================================================
import { ArrowRight } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import './sections.css';

export function CtaBanner({ contenu }) {
  return (
    <section className="cta" aria-labelledby="cta-titre">
      <img src={contenu.image} alt="" width="1920" height="640" loading="lazy" decoding="async" className="cta__image" />
      <Reveal className="container cta__content">
        <h2 id="cta-titre" className="cta__title">
          {contenu.titre}
        </h2>
        <p className="cta__text">{contenu.texte}</p>
        <Button to={contenu.bouton.to} iconRight={ArrowRight}>
          {contenu.bouton.libelle}
        </Button>
      </Reveal>
    </section>
  );
}
