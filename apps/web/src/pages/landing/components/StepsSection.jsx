// =============================================================================
// Landing page — section « Comment fonctionne ScolaRead ? »
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Trois étapes reliées par un trait pointillé (masqué sur mobile).
// Étape 01 : pastilles cliquables → recherche pré-filtrée par niveau.
// =============================================================================
import { Link } from 'react-router-dom';
import { cheminRecherche } from '../../../app/routes.js';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import { SectionHeading } from './SectionHeading.jsx';
import './sections.css';

function Pastille({ pastille, ton }) {
  if (pastille.criteres) {
    return (
      <Link to={cheminRecherche(pastille.criteres)} className="chip">
        {pastille.libelle}
      </Link>
    );
  }
  return <Badge tone={ton}>{pastille.libelle}</Badge>;
}

export function StepsSection({ contenu }) {
  return (
    <section className="landing-section landing-section--alt" aria-labelledby="etapes-titre">
      <div className="container">
        <Reveal>
          <SectionHeading id="etapes-titre" surtitre={contenu.surtitre} titre={contenu.titre} sousTitre={contenu.sousTitre} />
        </Reveal>
        <ol className="steps">
          {contenu.liste.map((etape, index) => (
            <Reveal as="li" key={etape.numero} delay={index * 120} className="steps__item">
              <article className="step-card">
                <span className={`step-card__number step-card__number--${etape.ton}`} aria-hidden="true">
                  {etape.numero}
                </span>
                <h3 className="step-card__title">
                  <span className="visually-hidden">Étape {etape.numero} : </span>
                  {etape.titre}
                </h3>
                <p className="step-card__text">{etape.texte}</p>
                <ul className="step-card__chips">
                  {etape.pastilles.map((pastille) => (
                    <li key={pastille.libelle}>
                      <Pastille pastille={pastille} ton={etape.tonPastilles} />
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
