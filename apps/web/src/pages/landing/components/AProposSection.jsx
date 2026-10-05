// =============================================================================
// Landing page — « À propos » (photo à gauche, panneau vert foncé à droite)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Présente le concept : la dispersion des ressources et la réponse ScolaRead.
// Cible de l'ancre « À propos » de l'en-tête et du bouton secondaire du hero.
// Animations : photo en parallaxe, contenu du panneau en cascade.
// =============================================================================
import { useRef } from 'react';
import { ArrowRightIcon, FilePdfIcon, FunnelSimpleIcon, StackIcon } from '@phosphor-icons/react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import { useParallaxe } from '../../../shared/hooks/useMouvement.js';
import { SectionHeading } from './SectionHeading.jsx';
import './sections.css';

const ICONES = { niveau: StackIcon, filtres: FunnelSimpleIcon, pdf: FilePdfIcon };

export function AProposSection({ contenu }) {
  const { image } = contenu;
  const refImage = useRef(null);
  useParallaxe(refImage, 0.09);

  return (
    <section id={contenu.ancre} className="a-propos" aria-labelledby="a-propos-titre" tabIndex={-1}>
      <div className="a-propos__media">
        <img
          ref={refImage}
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
        <Reveal className="a-propos__content cascade">
          <SectionHeading id="a-propos-titre" surtitre={contenu.surtitre} titre={contenu.titre} sombre />
          <p className="a-propos__text" style={{ '--i': 1 }}>
            {contenu.texte.map((segment) =>
              segment.fort ? <strong key={segment.texte}>{segment.texte}</strong> : segment.texte
            )}
          </p>

          <ul className="a-propos__atouts" style={{ '--i': 2 }}>
            {contenu.atouts.map((atout, index) => {
              const Icone = ICONES[atout.icone];
              return (
                <li key={atout.icone} className="a-propos__atout" style={{ '--j': index }}>
                  <span className="a-propos__atout-icone" aria-hidden="true">
                    <Icone weight="duotone" />
                  </span>
                  <span>
                    {atout.libelle[0]}
                    <br />
                    {atout.libelle[1]}
                  </span>
                </li>
              );
            })}
          </ul>

          <div style={{ '--i': 3 }}>
            <Button to={contenu.bouton.to} variant="light" iconRight={ArrowRightIcon}>
              {contenu.bouton.libelle}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
