// =============================================================================
// Page « /livres » — catalogue des livres publiés par les formateurs
// Recherche par mot-clé, filtres niveau et matière, tri, pagination.
// L'URL est la source de vérité (?q=&niveau=&matiere=&tri=&page=) : une
// recherche se partage par lien ; tout changement de critère revient page 1.
// =============================================================================
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BooksIcon, DownloadSimpleIcon, MagnifyingGlassIcon, UserIcon, XIcon } from '@phosphor-icons/react';
import { TRIS_LIVRES } from '@schoolbooks/shared';
import { cheminLivre } from '../../app/routes.js';
import { useApi } from '../../shared/hooks/useApi.js';
import { fetchMatieresLivres, fetchNiveauxScolaires } from '../../shared/auth/auth.api.js';
import { EmptyState, ErrorMessage, Loader } from '../../shared/components/StatusMessages.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { Pagination } from '../recherche/components/Pagination.jsx';
import { fetchLivres } from './livres.api.js';
import '../recherche/components/recherche.css';
import './livres.css';

const LIBELLES_TRIS = { recent: 'Plus récents', titre: 'Titre (A → Z)', telechargements: 'Plus téléchargés' };
const CRITERES = ['q', 'niveau', 'matiere', 'tri'];

function lireCriteres(params) {
  const page = Number(params.get('page'));
  return {
    q: params.get('q') ?? '',
    niveau: params.get('niveau') ?? '',
    matiere: params.get('matiere') ?? '',
    tri: TRIS_LIVRES.includes(params.get('tri')) ? params.get('tri') : 'recent',
    page: Number.isInteger(page) && page > 0 ? page : 1
  };
}

export function CarteLivre({ livre }) {
  return (
    <li>
      <Link to={cheminLivre(livre.id)} className="carte-livre">
        <span className="carte-livre__icone" aria-hidden="true">
          <BooksIcon weight="duotone" />
        </span>
        <span className="carte-livre__corps">
          <span className="carte-livre__titre">{livre.titre}</span>
          {livre.auteur && <span className="carte-livre__auteur">{livre.auteur}</span>}
          <span className="carte-livre__pastilles">
            <span>{livre.niveau.libelle}</span>
            <span>{livre.matiere.libelle}</span>
            {livre.annee && <span>{livre.annee}</span>}
          </span>
          <span className="carte-livre__pied">
            {livre.formateur && (
              <span>
                <UserIcon weight="bold" aria-hidden="true" /> {livre.formateur.nom}
              </span>
            )}
            <span>
              <DownloadSimpleIcon weight="bold" aria-hidden="true" /> {livre.telechargements} téléchargement
              {livre.telechargements > 1 ? 's' : ''}
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

export function LivresPage() {
  const [params, setParams] = useSearchParams();
  const criteres = lireCriteres(params);
  const [saisie, setSaisie] = useState(criteres.q);
  const niveaux = useApi((signal) => fetchNiveauxScolaires(signal), []);
  const matieres = useApi((signal) => fetchMatieresLivres(signal), []);
  const livres = useApi(
    (signal) => fetchLivres({ ...criteres, limit: 12 }, signal),
    [criteres.q, criteres.niveau, criteres.matiere, criteres.tri, criteres.page]
  );

  // Met à jour l'URL ; un changement de critère ramène à la page 1.
  function appliquer(modifications) {
    const suivant = { ...criteres, page: 1, ...modifications };
    const nouveaux = {};
    for (const cle of [...CRITERES, 'page']) {
      const valeur = suivant[cle];
      if (valeur && !(cle === 'page' && valeur === 1) && !(cle === 'tri' && valeur === 'recent')) nouveaux[cle] = String(valeur);
    }
    setParams(nouveaux);
  }

  const filtresActifs = Boolean(criteres.q || criteres.niveau || criteres.matiere);
  const data = livres.data;

  return (
    <div className="catalogue">
      <header className="catalogue__entete">
        <h1 className="catalogue__titre">Livres des formateurs</h1>
        <p className="catalogue__intro">
          Manuels, cours et exercices publiés par les formateurs. Créez un compte gratuit pour les lire et les télécharger.
        </p>
        <form
          className="catalogue__recherche"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            appliquer({ q: saisie.trim() });
          }}
        >
          <MagnifyingGlassIcon weight="bold" aria-hidden="true" className="catalogue__loupe" />
          <input
            type="search"
            value={saisie}
            maxLength={100}
            onChange={(event) => setSaisie(event.target.value)}
            placeholder="Titre, auteur, mot-clé…"
            aria-label="Rechercher un livre"
          />
          <Button type="submit" size="sm">
            Rechercher
          </Button>
        </form>
      </header>

      <div className="catalogue__filtres">
        <label>
          <span>Niveau</span>
          <select value={criteres.niveau} onChange={(event) => appliquer({ niveau: event.target.value })}>
            <option value="">Tous les niveaux</option>
            {(niveaux.data ?? []).map((n) => (
              <option key={n.code} value={n.code}>
                {n.libelle}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Matière</span>
          <select value={criteres.matiere} onChange={(event) => appliquer({ matiere: event.target.value })}>
            <option value="">Toutes les matières</option>
            {(matieres.data ?? []).map((m) => (
              <option key={m.code} value={m.code}>
                {m.libelle}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Trier par</span>
          <select value={criteres.tri} onChange={(event) => appliquer({ tri: event.target.value })}>
            {TRIS_LIVRES.map((tri) => (
              <option key={tri} value={tri}>
                {LIBELLES_TRIS[tri]}
              </option>
            ))}
          </select>
        </label>
        {filtresActifs && (
          <button
            type="button"
            className="catalogue__reinitialiser"
            onClick={() => {
              setSaisie('');
              setParams({});
            }}
          >
            <XIcon weight="bold" aria-hidden="true" /> Réinitialiser
          </button>
        )}
      </div>

      {livres.isLoading && <Loader label="Chargement des livres…" />}
      {livres.error && <ErrorMessage error={livres.error} onRetry={livres.reload} />}

      {data && (
        <>
          <p className="catalogue__compte" aria-live="polite">
            {data.total} livre{data.total > 1 ? 's' : ''}
          </p>
          {data.items.length === 0 ? (
            <EmptyState titre={data.message ?? 'Aucun livre.'}>
              {filtresActifs ? 'Essayez un autre mot-clé ou retirez un filtre.' : 'Aucun livre n’a encore été publié.'}
            </EmptyState>
          ) : (
            <ul className="catalogue__grille">
              {data.items.map((livre) => (
                <CarteLivre key={livre.id} livre={livre} />
              ))}
            </ul>
          )}
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onChange={(page) => {
              appliquer({ ...criteres, page });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
}
