// =============================================================================
// Landing page — « À propos » (photo à gauche, panneau vert foncé à droite)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Présente le concept : la dispersion des ressources et la réponse ScolaRead.
// Cible de l'ancre « À propos » de l'en-tête et du bouton secondaire du hero.
// =============================================================================
import { ArrowRight, FileDown, Layers, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import { SectionHeading } from './SectionHeading.jsx';
import './sections.css';

const ICONES = { niveau: Layers, filtres: SlidersHorizontal, pdf: FileDown };

export function AProposSection({ contenu }) {
  const { image } = contenu;

  return (
    <section id={contenu.ancre} className="a-propos" aria-labelledby="a-propos-titre" tabIndex={-1}>
      <div className="a-propos__media">
        <img
          src={image.src}
          alt={image.alt}
          width={image.largeur}
          height={image.hauteur}
          loading="lazy"
          decoding="async"
          className="a-propos__image"
        />
      </div>

      <div className="a-propos__panel">
        <Reveal className="a-propos__content">
          <SectionHeading id="a-propos-titre" surtitre={contenu.surtitre} titre={contenu.titre} sombre />
          <p className="a-propos__text">
            {contenu.texte.map((segment) =>
              segment.fort ? <strong key={segment.texte}>{segment.texte}</strong> : segment.texte
            )}
          </p>

          <ul className="a-propos__atouts">
            {contenu.atouts.map((atout) => {
              const Icone = ICONES[atout.icone];
              return (
                <li key={atout.icone} className="a-propos__atout">
                  <Icone aria-hidden="true" />
                  <span>
                    {atout.libelle[0]}
                    <br />
                    {atout.libelle[1]}
                  </span>
                </li>
              );
            })}
          </ul>

          <Button to={contenu.bouton.to} variant="light" iconRight={ArrowRight}>
            {contenu.bouton.libelle}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
