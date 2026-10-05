// =============================================================================
// Landing page — « Explorez nos ressources pédagogiques »
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Texte + photo (carte flottante), puis une carte par type de document
// menant à la recherche filtrée. Image sous la ligne de flottaison : lazy.
// Animations : texte depuis la gauche, photo dévoilée en rideau, forme verte
// qui glisse, carte flottante qui oscille, cartes en cascade.
// =============================================================================
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { IconeType } from '../../../shared/components/ui/IconeType.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import { SectionHeading } from './SectionHeading.jsx';
import './sections.css';

export function RessourcesSection({ contenu }) {
  const { image, carteFlottante } = contenu;

  return (
    <section className="landing-section ressources" aria-labelledby="ressources-titre">
      <div className="container">
        <div className="ressources__intro">
          <Reveal effet="gauche" className="ressources__text">
            <SectionHeading id="ressources-titre" surtitre={contenu.surtitre} titre={contenu.titre} texte={contenu.texte} />
            <Button to={contenu.bouton.to} iconRight={ArrowRightIcon} className="ressources__button">
              {contenu.bouton.libelle}
            </Button>
          </Reveal>

          <Reveal effet="zoom" className="ressources__media" delay={120}>
            <span className="ressources__shape" aria-hidden="true" />
            <span className="ressources__points" aria-hidden="true" />
            <div className="ressources__cadre">
              <img
                src={image.src}
                alt={image.alt}
                width={image.largeur}
                height={image.hauteur}
                loading="lazy"
                decoding="async"
                className="ressources__image"
              />
            </div>
            <div className="ressources__float">
              <div>
                <p className="ressources__float-title">{carteFlottante.titre}</p>
                <p className="ressources__float-text">{carteFlottante.texte}</p>
              </div>
              <Link to={carteFlottante.lien.to} className="ressources__float-btn" aria-label={carteFlottante.lien.libelle}>
                <ArrowRightIcon weight="bold" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>

        <ul className="types-grid">
          {contenu.cartes.map((carte, index) => (
            <Reveal as="li" key={carte.type} effet="monter" delay={index * 90}>
              <Link to={carte.to} className="type-card">
                <span className="type-card__icon">
                  <IconeType code={carte.type} />
                </span>
                <span className="type-card__title">{carte.titre}</span>
                <span className="type-card__text">{carte.texte}</span>
                <ArrowRightIcon className="type-card__arrow" weight="bold" aria-hidden="true" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
