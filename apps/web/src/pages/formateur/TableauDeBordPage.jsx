// =============================================================================
// Page « /formateur » — tableau de bord du formateur
// Disposition reprise de la maquette de référence :
//   en-tête (titre, « Ajouter un livre », « Exporter les données ») ;
//   4 cartes : livres publiés, téléchargements, livres actifs, matières utilisées ;
//   publications par jour | rappel | mes livres (liste) ;
//   livres les plus téléchargés | répartition (jauge) | chronomètre.
// Toutes les valeurs viennent de GET /api/books/trainer/mine (gabarit).
// =============================================================================
import { Link, useOutletContext } from 'react-router-dom';
import {
  ArrowUpIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  ArrowCounterClockwiseIcon,
  PlusIcon,
  UploadSimpleIcon
} from '@phosphor-icons/react';
import { ROUTES, cheminLivre } from '../../app/routes.js';
import { useApi } from '../../shared/hooks/useApi.js';
import { fetchMatieresLivres } from '../../shared/auth/auth.api.js';
import { ErrorMessage, Loader } from '../../shared/components/StatusMessages.jsx';
import { Chronometre, GraphiqueSemaine, IconeMatiere, Jauge } from './components/Widgets.jsx';
import {
  formatDateCourte,
  plusRecents,
  plusTelecharges,
  publicationsParJour,
  repartition,
  statistiques,
  statut,
  versCsv
} from './tableauDeBord.content.js';

const pluriel = (n, mot) => `${mot}${n > 1 ? 's' : ''}`;

function CarteStat({ titre, valeur, to, principale = false, badge, texte }) {
  return (
    <li className={`tdb-carte tdb-stat ${principale ? 'tdb-stat--principale' : ''}`}>
      <div className="tdb-stat__haut">
        <h2 className="tdb-stat__titre">{titre}</h2>
        <Link to={to} className="tdb-stat__fleche" aria-label={`Voir le détail : ${titre}`}>
          <ArrowUpRightIcon weight="bold" aria-hidden="true" />
        </Link>
      </div>
      <p className="tdb-stat__valeur">{valeur.toLocaleString('fr-FR')}</p>
      <p className="tdb-stat__pied">
        {badge !== undefined && (
          <span className="tdb-stat__badge">
            {badge}
            <ArrowUpIcon weight="bold" aria-hidden="true" />
          </span>
        )}
        <span>{texte}</span>
      </p>
    </li>
  );
}

function Rappel({ items }) {
  const desactives = items.filter((l) => !l.actif).length;
  const [dernier] = plusRecents(items, 1);

  let contenu;
  if (desactives > 0) {
    contenu = {
      titre: `${desactives} ${pluriel(desactives, 'livre')} ${pluriel(desactives, 'désactivé')} en attente`,
      detail: 'À restaurer ou supprimer définitivement',
      to: `${ROUTES.mesLivres}?filtre=inactifs`,
      icone: ArrowCounterClockwiseIcon,
      action: 'Gérer mes livres'
    };
  } else if (dernier) {
    contenu = {
      titre: `Dernière publication : ${dernier.titre}`,
      detail: `Ajouté le ${formatDateCourte(dernier.dateAjout)}`,
      to: cheminLivre(dernier.id),
      icone: BookOpenIcon,
      action: 'Voir le livre'
    };
  } else {
    contenu = {
      titre: 'Publiez votre premier livre',
      detail: 'Un PDF, un niveau et une matière suffisent',
      to: ROUTES.nouveauLivre,
      icone: UploadSimpleIcon,
      action: 'Ajouter un livre'
    };
  }
  const Icone = contenu.icone;

  return (
    <section className="tdb-carte tdb-rappel" aria-labelledby="titre-rappel">
      <h2 id="titre-rappel" className="tdb-carte__titre">
        Rappel
      </h2>
      <p className="tdb-rappel__titre">{contenu.titre}</p>
      <p className="tdb-rappel__detail">{contenu.detail}</p>
      <Link to={contenu.to} className="tdb-rappel__bouton">
        <Icone weight="fill" aria-hidden="true" />
        {contenu.action}
      </Link>
    </section>
  );
}

function exporterCsv(items) {
  const url = URL.createObjectURL(new Blob([versCsv(items)], { type: 'text/csv;charset=utf-8' }));
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = `mes-livres-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function TableauDeBordPage() {
  const { mesLivres } = useOutletContext();
  const matieres = useApi((signal) => fetchMatieresLivres(signal), []);
  const items = mesLivres.data?.items;

  if (!items) {
    return mesLivres.error ? (
      <ErrorMessage error={mesLivres.error} onRetry={mesLivres.reload} />
    ) : (
      <Loader label="Chargement du tableau de bord…" />
    );
  }

  const stats = statistiques(items, matieres.data?.length ?? null);
  const parts = repartition(items);
  const recents = plusRecents(items, 5);
  const populaires = plusTelecharges(items, 4);

  return (
    <div className="tdb-page">
      <header className="tdb-entete">
        <div>
          <h1 className="tdb-entete__titre">Tableau de bord</h1>
          <p className="tdb-entete__intro">Publiez, suivez et gérez vos livres en toute simplicité.</p>
        </div>
        <div className="tdb-entete__actions">
          <Link to={ROUTES.nouveauLivre} className="tdb-bouton tdb-bouton--plein">
            <PlusIcon weight="bold" aria-hidden="true" />
            Ajouter un livre
          </Link>
          <button
            type="button"
            className="tdb-bouton tdb-bouton--contour"
            onClick={() => exporterCsv(items)}
            disabled={items.length === 0}
          >
            Exporter les données
          </button>
        </div>
      </header>

      <ul className="tdb-stats" aria-label="Statistiques">
        <CarteStat
          principale
          titre="Livres publiés"
          valeur={stats.total}
          to={ROUTES.mesLivres}
          badge={stats.ajoutesCeMois > 0 ? stats.ajoutesCeMois : undefined}
          texte={
            stats.ajoutesCeMois > 0
              ? `${pluriel(stats.ajoutesCeMois, 'Ajouté')} ce mois-ci`
              : 'Aucun ajout ce mois-ci'
          }
        />
        <CarteStat
          titre="Téléchargements"
          valeur={stats.telechargements}
          to={ROUTES.mesLivres}
          texte={stats.total ? `Soit ${stats.moyenne} en moyenne par livre` : 'Aucun livre téléchargé'}
        />
        <CarteStat
          titre="Livres actifs"
          valeur={stats.actifs}
          to={`${ROUTES.mesLivres}?filtre=actifs`}
          texte={
            stats.total
              ? `${Math.round((stats.actifs / stats.total) * 100)} % du catalogue · ${stats.desactives} ${pluriel(stats.desactives, 'désactivé')}`
              : 'Aucun livre en ligne'
          }
        />
        <CarteStat
          titre="Matières utilisées"
          valeur={stats.matieres}
          to={ROUTES.livres}
          texte={
            stats.totalMatieres ? `Sur ${stats.totalMatieres} matières disponibles` : 'Matières couvertes'
          }
        />
      </ul>

      <div className="tdb-grille">
        <div className="tdb-grille__gauche">
          <div className="tdb-ligne tdb-ligne--haut">
            <section className="tdb-carte tdb-analyse" aria-labelledby="titre-analyse">
              <h2 id="titre-analyse" className="tdb-carte__titre">
                Publications par jour
              </h2>
              <GraphiqueSemaine jours={publicationsParJour(items)} />
            </section>
            <Rappel items={items} />
          </div>

          <div className="tdb-ligne tdb-ligne--bas">
            <section className="tdb-carte tdb-equipe" aria-labelledby="titre-populaires">
              <div className="tdb-carte__entete">
                <h2 id="titre-populaires" className="tdb-carte__titre">
                  Livres les plus téléchargés
                </h2>
                <Link to={ROUTES.nouveauLivre} className="tdb-pilule">
                  <PlusIcon weight="bold" aria-hidden="true" /> Ajouter
                </Link>
              </div>
              {populaires.length === 0 ? (
                <p className="tdb-vide">Vos livres les plus téléchargés apparaîtront ici.</p>
              ) : (
                <ul className="tdb-equipe__liste">
                  {populaires.map((livre) => {
                    const s = statut(livre);
                    return (
                      <li key={livre.id}>
                        <IconeMatiere code={livre.matiere.code} pastille />
                        <div className="tdb-equipe__texte">
                          <Link to={cheminLivre(livre.id)} className="tdb-equipe__nom">
                            {livre.titre}
                          </Link>
                          <span className="tdb-equipe__detail">
                            {livre.telechargements} {pluriel(livre.telechargements, 'téléchargement')} ·{' '}
                            <strong>{livre.matiere.libelle}</strong>
                          </span>
                        </div>
                        <span className={`tdb-statut tdb-statut--${s.cle}`}>{s.libelle}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="tdb-carte tdb-progression" aria-labelledby="titre-progression">
              <h2 id="titre-progression" className="tdb-carte__titre">
                État du catalogue
              </h2>
              <Jauge repartition={parts} libelle="Livres actifs" />
              <ul className="tdb-legende">
                <li title={`${parts.telechargeables} livre(s)`}>
                  <span className="tdb-legende__pastille tdb-legende__pastille--vert" aria-hidden="true" />
                  Téléchargeables
                </li>
                <li title={`${parts.lectureSeule} livre(s)`}>
                  <span className="tdb-legende__pastille tdb-legende__pastille--fonce" aria-hidden="true" />
                  Lecture seule
                </li>
                <li title={`${parts.desactives} livre(s)`}>
                  <span
                    className="tdb-legende__pastille tdb-legende__pastille--hachuree"
                    aria-hidden="true"
                  />
                  Désactivés
                </li>
              </ul>
            </section>
          </div>
        </div>

        <div className="tdb-grille__droite">
          <section className="tdb-carte tdb-projets" aria-labelledby="titre-mes-livres">
            <div className="tdb-carte__entete">
              <h2 id="titre-mes-livres" className="tdb-carte__titre">
                Mes livres
              </h2>
              <Link to={ROUTES.nouveauLivre} className="tdb-pilule">
                <PlusIcon weight="bold" aria-hidden="true" /> Nouveau
              </Link>
            </div>
            {recents.length === 0 ? (
              <p className="tdb-vide">Aucun livre publié pour l’instant.</p>
            ) : (
              <ul className="tdb-projets__liste">
                {recents.map((livre) => (
                  <li key={livre.id}>
                    <IconeMatiere code={livre.matiere.code} />
                    <div>
                      <Link to={cheminLivre(livre.id)} className="tdb-projets__titre">
                        {livre.titre}
                      </Link>
                      <span className="tdb-projets__date">Ajouté le {formatDateCourte(livre.dateAjout)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <Chronometre />
        </div>
      </div>
    </div>
  );
}
