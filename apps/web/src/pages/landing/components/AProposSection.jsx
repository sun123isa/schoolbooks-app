// =============================================================================
// Landing page — « À propos de ScolaRead »
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Présente le concept : la dispersion des ressources (avant) et la réponse de
// ScolaRead (avec). Composition de deux photos + carte « classé par », texte,
// comparatif avant / avec, appel à l'action.
// Cible de l'ancre « À propos » (bouton secondaire du hero, pied de page).
// Animations : photos en zoom et parallaxe, critères en cascade, comparatif
// qui se construit colonne par colonne.
// =============================================================================
import { useRef } from 'react';
import {
  ArrowRightIcon,
  ChalkboardTeacherIcon,
  ChatsCircleIcon,
  CheckCircleIcon,
  FolderOpenIcon,
  UsersThreeIcon
} from '@phosphor-icons/react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import { useParallaxe } from '../../../shared/hooks/useMouvement.js';
import { SectionHeading } from './SectionHeading.jsx';
import './sections.css';

const ICONES_AVANT = {
  discussions: ChatsCircleIcon,
  fichiers: FolderOpenIcon,
  camarades: UsersThreeIcon,
  enseignants: ChalkboardTeacherIcon
};

function Composition({ images, classement }) {
  const refSecondaire = useRef(null);
  useParallaxe(refSecondaire, 0.12);

  return (
    <Reveal effet="zoom" className="a-propos__composition">
      <span className="a-propos__anneau" aria-hidden="true" />
      <div className="a-propos__photo a-propos__photo--principale">
        <img
          src={images.principale.src}
          alt={images.principale.alt}
          width={images.principale.largeur}
          height={images.principale.hauteur}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="a-propos__photo a-propos__photo--secondaire" ref={refSecondaire}>
        <img
          src={images.secondaire.src}
          alt={images.secondaire.alt}
          width={images.secondaire.largeur}
          height={images.secondaire.hauteur}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="a-propos__classement">
        <p className="a-propos__classement-titre">{classement.titre}</p>
        <ul className="a-propos__criteres">
          {classement.criteres.map((critere, index) => (
            <li key={critere} style={{ '--j': index }}>
              {critere}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

function Comparatif({ avant, avec }) {
  return (
    <div className="comparatif">
      <div className="comparatif__colonne comparatif__colonne--avant">
        <p className="comparatif__titre">{avant.titre}</p>
        <ul className="comparatif__liste">
          {avant.elements.map((element, index) => {
            const Icone = ICONES_AVANT[element.icone];
            return (
              <li key={element.icone} style={{ '--j': index }}>
                <Icone weight="duotone" aria-hidden="true" />
                {element.texte}
              </li>
            );
          })}
        </ul>
        <p className="comparatif__conclusion">{avant.conclusion}</p>
      </div>

      <span className="comparatif__fleche" aria-hidden="true">
        <ArrowRightIcon weight="bold" />
      </span>

      <div className="comparatif__colonne comparatif__colonne--avec">
        <p className="comparatif__titre">{avec.titre}</p>
        <ul className="comparatif__liste">
          {avec.elements.map((element, index) => (
            <li key={element} style={{ '--j': index + avant.elements.length }}>
              <CheckCircleIcon weight="fill" aria-hidden="true" />
              {element}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AProposSection({ contenu }) {
  return (
    <section id={contenu.ancre} className="a-propos" aria-labelledby="a-propos-titre" tabIndex={-1}>
      <div className="container a-propos__grille">
        <Composition images={contenu.images} classement={contenu.classement} />

        <Reveal className="a-propos__contenu cascade">
          <SectionHeading id="a-propos-titre" surtitre={contenu.surtitre} titre={contenu.titre} sombre />
          <p className="a-propos__intro" style={{ '--i': 1 }}>
            {contenu.intro}
          </p>
          <div style={{ '--i': 2 }}>
            <Comparatif avant={contenu.avant} avec={contenu.avec} />
          </div>
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
