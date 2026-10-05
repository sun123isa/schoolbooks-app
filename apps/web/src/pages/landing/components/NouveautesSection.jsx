// =============================================================================
// Landing page — « Nouveautés du catalogue » (dernières ressources ajoutées)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Données : GET /api/ressources?tri=recent (filtrable par niveau).
// Mise en page : une ressource à la une (grande photo) + une liste compacte.
// Chaque carte mène à la fiche. Photo choisie selon le type de document,
// sans doublon (l'API ne fournit pas d'image) ; titres et séries sans tiret.
// Manque côté API : pas de date d'ajout dans le résumé d'une ressource.
// =============================================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, DownloadSimpleIcon, EyeIcon, SparkleIcon } from '@phosphor-icons/react';
import { cheminRessource } from '../../../app/routes.js';
import { useApi } from '../../../shared/hooks/useApi.js';
import { EmptyState, ErrorMessage } from '../../../shared/components/StatusMessages.jsx';
import { IconeType } from '../../../shared/components/ui/IconeType.jsx';
import { Reveal } from '../../../shared/components/ui/Reveal.jsx';
import { filiereCourte, titreRessource } from '../../../shared/format/libelles.js';
import { fetchNouveautes } from '../landing.api.js';
import { attribuerImages, cheminNouveautes } from '../landing.content.js';
import { SectionHeading } from './SectionHeading.jsx';
import './sections.css';

const classement = (ressource, toutesSeries) =>
  [ressource.niveau.libelle, filiereCourte(ressource.filiere?.libelle) ?? toutesSeries, ressource.matiere.libelle].join(' · ');

function Acces({ ressource, contenu }) {
  return ressource.telechargeable ? (
    <span className="nouveaute__acces nouveaute__acces--telechargeable">
      <DownloadSimpleIcon weight="bold" aria-hidden="true" />
      {contenu.telechargeable}
    </span>
  ) : (
    <span className="nouveaute__acces">
      <EyeIcon weight="bold" aria-hidden="true" />
      {contenu.enLigne}
    </span>
  );
}

function CarteUne({ ressource, image, contenu }) {
  return (
    <article className="nouveaute nouveaute--une">
      <div className="nouveaute__media">
        <img
          src={image}
          alt=""
          width="800"
          height="500"
          loading="lazy"
          decoding="async"
        />
        <span className="nouveaute__ruban">
          <SparkleIcon weight="fill" aria-hidden="true" />
          {contenu.nouveau}
        </span>
        <span className="nouveaute__type">
          <IconeType code={ressource.type.code} />
          {ressource.type.libelle}
        </span>
      </div>
      <div className="nouveaute__corps">
        <p className="nouveaute__meta">{classement(ressource, contenu.toutesSeries)}</p>
        <h3 className="nouveaute__titre">
          <Link to={cheminRessource(ressource.id)} className="nouveaute__lien">
            {titreRessource(ressource.titre)}
          </Link>
        </h3>
        <div className="nouveaute__pied">
          {ressource.annee && <span className="nouveaute__annee">{ressource.annee}</span>}
          <Acces ressource={ressource} contenu={contenu} />
          <span className="nouveaute__plus" aria-hidden="true">
            {contenu.lienCarte}
            <ArrowRightIcon weight="bold" />
          </span>
        </div>
      </div>
    </article>
  );
}

function CarteCompacte({ ressource, image, contenu }) {
  return (
    <article className="nouveaute nouveaute--compacte">
      <div className="nouveaute__vignette">
        <img
          src={image}
          alt=""
          width="800"
          height="500"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="nouveaute__corps">
        <p className="nouveaute__type-texte">
          <IconeType code={ressource.type.code} />
          {ressource.type.libelle}
          {ressource.annee && <span className="nouveaute__annee">{ressource.annee}</span>}
        </p>
        <h3 className="nouveaute__titre">
          <Link to={cheminRessource(ressource.id)} className="nouveaute__lien">
            {titreRessource(ressource.titre)}
          </Link>
        </h3>
        <p className="nouveaute__meta">{classement(ressource, contenu.toutesSeries)}</p>
      </div>
      <ArrowRightIcon className="nouveaute__fleche" weight="bold" aria-hidden="true" />
    </article>
  );
}

function Squelettes() {
  return (
    <div className="nouveautes__grille" aria-hidden="true">
      <div className="nouveaute nouveaute--une nouveaute--squelette">
        <div className="nouveaute__media squelette" />
        <div className="nouveaute__corps">
          <span className="squelette squelette--court" />
          <span className="squelette" />
          <span className="squelette squelette--moyen" />
        </div>
      </div>
      <div className="nouveautes__liste">
        {[0, 1, 2].map((index) => (
          <div key={index} className="nouveaute nouveaute--compacte nouveaute--squelette">
            <div className="nouveaute__vignette squelette" />
            <div className="nouveaute__corps">
              <span className="squelette squelette--court" />
              <span className="squelette" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NouveautesSection({ contenu }) {
  const [niveau, setNiveau] = useState('');
  const nouveautes = useApi((signal) => fetchNouveautes(contenu.nombre, niveau, signal), [contenu.nombre, niveau]);
  const ressources = nouveautes.data ?? [];
  const images = attribuerImages(ressources, contenu.images);
  const [une, ...autres] = ressources;

  return (
    <section className="landing-section nouveautes" aria-labelledby="nouveautes-titre">
      <div className="container">
        <Reveal effet="gauche" className="nouveautes__head">
          <SectionHeading id="nouveautes-titre" surtitre={contenu.surtitre} titre={contenu.titre} texte={contenu.texte} />
          <div className="nouveautes__outils">
            <div className="nouveautes__filtres" role="group" aria-label={contenu.filtresLabel}>
              {contenu.filtres.map((filtre) => (
                <button
                  key={filtre.code || 'tout'}
                  type="button"
                  className="nouveautes__filtre"
                  aria-pressed={niveau === filtre.code}
                  onClick={() => setNiveau(filtre.code)}
                >
                  {filtre.libelle}
                </button>
              ))}
            </div>
            <Link to={cheminNouveautes(niveau)} className="lien-fleche">
              {contenu.lienTout}
              <ArrowRightIcon weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        {nouveautes.error && <ErrorMessage error={nouveautes.error} onRetry={nouveautes.reload} />}
        {nouveautes.data?.length === 0 && <EmptyState>{contenu.vide}</EmptyState>}
        {nouveautes.isLoading && <Squelettes />}

        {une && (
          // `key` : la grille se rejoue à chaque changement de filtre.
          <div className="nouveautes__grille" key={niveau || 'tout'} aria-live="polite">
            <Reveal effet="zoom" className="nouveautes__une">
              <CarteUne ressource={une} image={images[0]} contenu={contenu} />
            </Reveal>
            {autres.length > 0 && (
              <ul className="nouveautes__liste">
                {autres.map((ressource, index) => (
                  <Reveal as="li" key={ressource.id} effet="droite" delay={120 + index * 120}>
                    <CarteCompacte ressource={ressource} image={images[index + 1]} contenu={contenu} />
                  </Reveal>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
