// =============================================================================
// Landing page — « Explorez nos ressources pédagogiques »
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Texte + photo (carte flottante), puis une carte par type de document
// menant à la recherche filtrée. Image sous la ligne de flottaison : lazy.
// =============================================================================
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FileCheck, FileText, PencilLine, Presentation } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import { SectionHeading } from './SectionHeading.jsx';
import './sections.css';

const ICONES = { 'sujet-examen': FileText, corrige: FileCheck, livre: BookOpen, cours: Presentation, exercices: PencilLine };

export function RessourcesSection({ contenu }) {
  const { image, carteFlottante } = contenu;

  return (
    <section className="landing-section ressources" aria-labelledby="ressources-titre">
      <div className="container">
        <div className="ressources__intro">
          <Reveal className="ressources__text">
            <SectionHeading id="ressources-titre" surtitre={contenu.surtitre} titre={contenu.titre} texte={contenu.texte} />
            <Button to={contenu.bouton.to} iconRight={ArrowRight} className="ressources__button">
              {contenu.bouton.libelle}
            </Button>
          </Reveal>

          <Reveal className="ressources__media" delay={100}>
            <span className="ressources__shape" aria-hidden="true" />
            <img
              src={image.src}
              alt={image.alt}
              width={image.largeur}
              height={image.hauteur}
              loading="lazy"
              decoding="async"
              className="ressources__image"
            />
            <div className="ressources__float">
              <div>
                <p className="ressources__float-title">{carteFlottante.titre}</p>
                <p className="ressources__float-text">{carteFlottante.texte}</p>
              </div>
              <Link to={carteFlottante.lien.to} className="ressources__float-btn" aria-label={carteFlottante.lien.libelle}>
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>

        <ul className="types-grid">
          {contenu.cartes.map((carte, index) => {
            const Icone = ICONES[carte.type];
            return (
              <Reveal as="li" key={carte.type} delay={index * 60}>
                <Link to={carte.to} className="type-card">
                  <span className="type-card__icon" aria-hidden="true">
                    <Icone />
                  </span>
                  <span className="type-card__title">{carte.titre}</span>
                  <span className="type-card__text">{carte.texte}</span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
