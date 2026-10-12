// =============================================================================
// Page de recherche — route « /recherche »
// Responsable : Graciel MBEMBA — relecture : Salem KONGOLO
// Tickets Jira : « Recherche par mot-clé », « Filtres par niveau, série/filière,
// matière, année, type », « Résultats de recherche », « Message en l'absence de résultat »
//
// L'URL est la seule source de vérité (useCriteresUrl) : chaque action de
// l'utilisateur modifie l'URL, qui déclenche la recherche. Une recherche se
// partage donc par lien, et les critères venant de la landing sont repris.
// =============================================================================
import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../../shared/hooks/useApi.js';
import { EmptyState, ErrorMessage } from '../../shared/components/StatusMessages.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { filiereComplete } from '../../shared/format/libelles.js';
import { fetchFilieres, fetchReferentielsFiltres, rechercherRessources } from './recherche.api.js';
import { CRITERES, useCriteresUrl } from './useCriteresUrl.js';
import { TEXTES, TRIS, criteresActifs, libelleTotal } from './recherche.content.js';
import { BarreRecherche } from './components/BarreRecherche.jsx';
import { PanneauFiltres } from './components/PanneauFiltres.jsx';
import { FiltresActifs } from './components/FiltresActifs.jsx';
import { CarteResultat, CarteSquelette } from './components/CarteResultat.jsx';
import { Pagination } from './components/Pagination.jsx';
import './components/recherche.css';

const NOMBRE_SQUELETTES = 6;
const toutEffacer = Object.fromEntries(CRITERES.map((cle) => [cle, undefined]));

function EnTeteResultats({ total, tri, onTri }) {
  return (
    <div className="resultats__entete">
      <p className="resultats__total" aria-live="polite">
        {total === null ? TEXTES.resultats.chargement : libelleTotal(total)}
      </p>
      <label className="resultats__tri">
        <span>{TEXTES.resultats.tri}</span>
        <select value={tri ?? 'pertinence'} onChange={(event) => onTri(event.target.value)}>
          {TRIS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.libelle}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function AucunResultat({ message, actifs, onRetirer, onToutRetirer }) {
  return (
    <EmptyState
      titre={TEXTES.resultats.aucunTitre}
      action={
        actifs.length > 0 && (
          <div className="aucun-resultat">
            <p>{TEXTES.resultats.elargir}</p>
            <ul className="aucun-resultat__liste">
              {actifs.map((actif) => (
                <li key={actif.cle}>
                  <button type="button" className="actifs__pastille" onClick={() => onRetirer(actif.cle)}>
                    {TEXTES.actifs.retirer(actif.libelle)}
                  </button>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" onClick={onToutRetirer}>
              {TEXTES.resultats.toutRetirer}
            </Button>
          </div>
        )
      }
    >
      {message}
    </EmptyState>
  );
}

export function RecherchePage() {
  const location = useLocation();
  const { criteres, modifierCriteres } = useCriteresUrl();
  const refResultats = useRef(null);

  const referentiels = useApi((signal) => fetchReferentielsFiltres(signal), []);
  const filieres = useApi(
    (signal) => (criteres.niveau ? fetchFilieres(criteres.niveau, signal) : Promise.resolve([])),
    [criteres.niveau ?? '']
  );
  const resultats = useApi((signal) => rechercherRessources(criteres, signal), [location.search]);

  const actifs = criteresActifs(criteres, { ...referentiels.data, filieres: filieres.data ?? [] });
  // Liste des séries/filières sans tiret : « Série C (Mathématiques et sciences physiques) ».
  const optionsFilieres = (filieres.data ?? []).map((filiere) => ({ ...filiere, libelle: filiereComplete(filiere.libelle) }));
  const retirer = (cle) => modifierCriteres({ [cle]: undefined });
  const toutRetirer = () => modifierCriteres(toutEffacer);

  const changerPage = (page) => {
    modifierCriteres({ page });
    refResultats.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const data = resultats.data;

  return (
    <div className="recherche">
      <header className="recherche__bandeau">
        <h1 className="recherche__titre">{TEXTES.titre}</h1>
        <p className="recherche__sous-titre">{TEXTES.sousTitre}</p>
        <BarreRecherche key={criteres.q ?? ''} valeur={criteres.q} onRechercher={(q) => modifierCriteres({ q })} />
      </header>

      <div className="recherche__corps">
        <PanneauFiltres
          criteres={criteres}
          referentiels={referentiels.data}
          filieres={optionsFilieres}
          nombreActifs={actifs.filter((actif) => actif.cle !== 'q').length}
          onChange={modifierCriteres}
          onReinitialiser={() => modifierCriteres({ ...toutEffacer, q: criteres.q, tri: criteres.tri })}
        />

        <section className="resultats" aria-labelledby="titre-resultats" ref={refResultats}>
          <h2 id="titre-resultats" className="visually-hidden">
            Résultats
          </h2>
          {referentiels.error && <ErrorMessage error={referentiels.error} onRetry={referentiels.reload} />}

          <FiltresActifs actifs={actifs} onRetirer={retirer} onToutRetirer={toutRetirer} />
          <EnTeteResultats
            total={data ? data.total : null}
            tri={criteres.tri}
            onTri={(tri) => modifierCriteres({ tri })}
          />

          {resultats.error && <ErrorMessage error={resultats.error} onRetry={resultats.reload} />}

          {resultats.isLoading && (
            <ul className="resultats__grille" aria-busy="true">
              {Array.from({ length: NOMBRE_SQUELETTES }, (_, index) => (
                <li key={index}>
                  <CarteSquelette />
                </li>
              ))}
            </ul>
          )}

          {data?.total === 0 && (
            <AucunResultat message={data.message} actifs={actifs} onRetirer={retirer} onToutRetirer={toutRetirer} />
          )}

          {data?.total > 0 && (
            <>
              <ul className="resultats__grille">
                {data.items.map((ressource, index) => (
                  <li key={ressource.id} className="resultats__item" style={{ '--i': index }}>
                    <CarteResultat ressource={ressource} retour={location.search} />
                  </li>
                ))}
              </ul>
              <Pagination page={data.page} totalPages={data.totalPages} onChange={changerPage} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Note : Graciel MBEMBA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
