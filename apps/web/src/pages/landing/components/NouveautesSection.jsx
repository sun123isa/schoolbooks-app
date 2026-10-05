// =============================================================================
// Landing page — « Nouveautés du catalogue » (3 dernières ressources ajoutées)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Données : GET /api/ressources?tri=recent. La carte mène à la fiche, avec
// l'état `retour` attendu par la page de consultation.
// Manque côté API : pas de date d'ajout dans le résumé d'une ressource, la
// carte affiche donc type · niveau · année à la place de la date.
// =============================================================================
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cheminRessource } from '../../../app/routes.js';
import { useApi } from '../../../shared/hooks/useApi.js';
import { EmptyState, ErrorMessage } from '../../../shared/components/StatusMessages.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import { fetchNouveautes } from '../landing.api.js';
import { SectionHeading } from './SectionHeading.jsx';
import './sections.css';

const meta = (ressource) =>
  [ressource.type.libelle, ressource.niveau.libelle, ressource.annee].filter(Boolean).join(' · ');

function CarteNouveaute({ ressource, image, libelleLien }) {
  return (
    <article className="news-card">
      <img src={image} alt="" width="800" height="500" loading="lazy" decoding="async" className="news-card__image" />
      <div className="news-card__body">
        <p className="news-card__meta">{meta(ressource)}</p>
        <h3 className="news-card__title">
          <Link to={cheminRessource(ressource.id)} className="news-card__link">
            {ressource.titre}
          </Link>
        </h3>
        <p className="news-card__more" aria-hidden="true">
          {libelleLien}
          <ArrowRight />
        </p>
      </div>
    </article>
  );
}

function CarteSquelette() {
  return (
    <div className="news-card news-card--squelette" aria-hidden="true">
      <div className="news-card__image" />
      <div className="news-card__body">
        <span className="squelette squelette--court" />
        <span className="squelette" />
        <span className="squelette squelette--moyen" />
      </div>
    </div>
  );
}

export function NouveautesSection({ contenu }) {
  const nouveautes = useApi((signal) => fetchNouveautes(contenu.nombre, signal), [contenu.nombre]);

  return (
    <section className="landing-section landing-section--alt" aria-labelledby="nouveautes-titre">
      <div className="container">
        <Reveal className="nouveautes__head">
          <SectionHeading id="nouveautes-titre" surtitre={contenu.surtitre} titre={contenu.titre} texte={contenu.texte} />
          <Link to={contenu.lienTout.to} className="lien-fleche">
            {contenu.lienTout.libelle}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Reveal>

        {nouveautes.error && <ErrorMessage error={nouveautes.error} onRetry={nouveautes.reload} />}
        {nouveautes.data?.length === 0 && <EmptyState>{contenu.vide}</EmptyState>}

        {(nouveautes.isLoading || nouveautes.data?.length > 0) && (
          <ul className="news-grid" aria-busy={nouveautes.isLoading}>
            {nouveautes.isLoading
              ? contenu.images.map((image) => (
                  <li key={image}>
                    <CarteSquelette />
                  </li>
                ))
              : nouveautes.data.map((ressource, index) => (
                  <Reveal as="li" key={ressource.id} delay={index * 80}>
                    <CarteNouveaute
                      ressource={ressource}
                      image={contenu.images[index % contenu.images.length]}
                      libelleLien={contenu.lienCarte}
                    />
                  </Reveal>
                ))}
          </ul>
        )}
      </div>
    </section>
  );
}
