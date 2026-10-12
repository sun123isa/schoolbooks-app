// =============================================================================
// Landing page — « Pour les formateurs »
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Présente l'espace de publication des formateurs (et non le catalogue) :
// texte + parcours en 3 étapes + boutons, et à droite une photo sur laquelle
// flottent des éléments du tableau de bord (illustration, sans chiffre).
// Animations : texte depuis la gauche, composition en zoom, cartes qui flottent.
// =============================================================================
import {
  ArrowRightIcon,
  ChartLineUpIcon,
  CheckCircleIcon,
  UploadSimpleIcon,
  UserPlusIcon
} from '@phosphor-icons/react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import { SectionHeading } from './SectionHeading.jsx';
import './formateurs.css';

const ICONES = { compte: UserPlusIcon, publier: UploadSimpleIcon, suivre: ChartLineUpIcon };

// Barres du mini-graphique : hauteur (%) et style, comme sur le tableau de bord.
const BARRES = [
  ['pleine', 58],
  ['hachuree', 74],
  ['foncee', 100],
  ['claire', 70],
  ['hachuree', 82],
  ['pleine', 46],
  ['hachuree', 66]
];

function Visuel({ contenu }) {
  const { image, visuel } = contenu;
  return (
    <div className="formateurs__composition">
      <span className="formateurs__forme" aria-hidden="true" />
      <div className="formateurs__cadre">
        <img
          src={image.src}
          alt={image.alt}
          width={image.largeur}
          height={image.hauteur}
          loading="lazy"
          decoding="async"
          className="formateurs__image"
        />
      </div>

      <div className="formateurs__flottant formateurs__publie" aria-hidden="true">
        <CheckCircleIcon weight="fill" />
        <span>
          <strong>{visuel.publie.titre}</strong>
          <small>{visuel.publie.texte}</small>
        </span>
      </div>

      <div className="formateurs__flottant formateurs__graphique" aria-hidden="true">
        <p>{visuel.statistiques}</p>
        <ul>
          {BARRES.map(([style, hauteur], index) => (
            <li key={visuel.jours[index] + index}>
              <span
                className={`formateurs__barre formateurs__barre--${style}`}
                style={{ height: `${hauteur}%` }}
              />
              <small>{visuel.jours[index]}</small>
            </li>
          ))}
        </ul>
      </div>

      <div className="formateurs__flottant formateurs__jauge" aria-hidden="true">
        <svg viewBox="0 0 120 68">
          <path d="M 12 60 A 48 48 0 0 1 108 60" className="formateurs__jauge-fond" />
          <path d="M 12 60 A 48 48 0 0 1 92 26" className="formateurs__jauge-valeur" />
        </svg>
        <small>{visuel.jauge}</small>
      </div>
    </div>
  );
}

export function FormateursSection({ contenu }) {
  return (
    <section className="landing-section formateurs" aria-labelledby="formateurs-titre">
      <div className="container formateurs__grille">
        <Reveal effet="gauche" className="formateurs__texte">
          <SectionHeading
            id="formateurs-titre"
            surtitre={contenu.surtitre}
            titre={contenu.titre}
            texte={contenu.texte}
          />

          <ol className="formateurs__etapes">
            {contenu.etapes.map((etape, index) => {
              const Icone = ICONES[etape.icone];
              return (
                <li key={etape.titre} style={{ '--i': index }}>
                  <span className="formateurs__etape-icone" aria-hidden="true">
                    <Icone weight="duotone" />
                  </span>
                  <span>
                    <strong>
                      <span className="formateurs__etape-numero">0{index + 1}</span> {etape.titre}
                    </strong>
                    <small>{etape.texte}</small>
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="formateurs__boutons">
            <Button to={contenu.boutons.principal.to} iconRight={ArrowRightIcon}>
              {contenu.boutons.principal.libelle}
            </Button>
            <Button to={contenu.boutons.secondaire.to} variant="outline">
              {contenu.boutons.secondaire.libelle}
            </Button>
          </div>
        </Reveal>

        <Reveal effet="zoom" delay={120} className="formateurs__media">
          <Visuel contenu={contenu} />
        </Reveal>
      </div>
    </section>
  );
}
