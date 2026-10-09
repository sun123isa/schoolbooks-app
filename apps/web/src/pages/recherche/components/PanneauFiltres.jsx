// =============================================================================
// Page de recherche — panneau de filtres
// Responsable : Graciel MBEMBA — relecture : Salem KONGOLO
// Niveau (boutons radio), puis série/filière, matière, année et type (listes).
// BR02 : les séries/filières proposées sont celles du niveau choisi ; la liste
// est désactivée sans niveau (le changement de niveau efface la filière :
// géré par useCriteresUrl). Sur smartphone, le panneau est repliable.
// =============================================================================
import { useId, useState } from 'react';
import { ArrowCounterClockwiseIcon, CaretDownIcon, FunnelSimpleIcon } from '@phosphor-icons/react';
import { TEXTES } from '../recherche.content.js';

const T = TEXTES.filtres;

function ChampSelect({ label, valeur, options, vide, disabled, aide, onChange }) {
  const id = useId();
  return (
    <div className="champ">
      <label htmlFor={id} className="champ__label">
        {label}
      </label>
      <div className="champ__select">
        <select
          id={id}
          value={valeur ?? ''}
          disabled={disabled}
          aria-describedby={aide ? `${id}-aide` : undefined}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{vide}</option>
          {options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.libelle}
            </option>
          ))}
        </select>
        <CaretDownIcon className="champ__chevron" weight="bold" aria-hidden="true" />
      </div>
      {aide && (
        <p id={`${id}-aide`} className="champ__aide">
          {aide}
        </p>
      )}
    </div>
  );
}

function ChoixNiveau({ niveaux, valeur, onChange }) {
  const nom = useId();
  const options = [{ code: '', libelle: T.tousNiveaux }, ...niveaux];
  return (
    <fieldset className="champ champ--niveau">
      <legend className="champ__label">{T.niveau}</legend>
      <div className="segments">
        {options.map((option) => (
          <label key={option.code || 'tous'} className="segments__option">
            <input
              type="radio"
              name={nom}
              value={option.code}
              checked={(valeur ?? '') === option.code}
              onChange={() => onChange(option.code)}
            />
            <span>{option.libelle}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function PanneauFiltres({ criteres, referentiels, filieres, nombreActifs, onChange, onReinitialiser }) {
  const [ouvert, setOuvert] = useState(false);
  const idPanneau = useId();
  const { niveaux = [], matieres = [], annees = [], types = [] } = referentiels ?? {};
  const optionsAnnees = annees.map((annee) => ({ code: String(annee), libelle: String(annee) }));

  return (
    <aside className={`filtres ${ouvert ? 'filtres--ouvert' : ''}`} aria-label={T.titre}>
      <button
        type="button"
        className="filtres__bascule"
        aria-expanded={ouvert}
        aria-controls={idPanneau}
        onClick={() => setOuvert((valeur) => !valeur)}
      >
        <FunnelSimpleIcon weight="bold" aria-hidden="true" />
        {ouvert ? T.fermer : T.ouvrir}
        {nombreActifs > 0 && <span className="filtres__compteur">{nombreActifs}</span>}
        <CaretDownIcon className="filtres__caret" weight="bold" aria-hidden="true" />
      </button>

      <div className="filtres__panneau" id={idPanneau}>
        <div className="filtres__entete">
          <h2 className="filtres__titre">
            <FunnelSimpleIcon weight="duotone" aria-hidden="true" />
            {T.titre}
          </h2>
          {nombreActifs > 0 && <span className="filtres__compteur">{nombreActifs}</span>}
        </div>

        {!referentiels ? (
          <p className="filtres__chargement" role="status">
            {T.chargement}
          </p>
        ) : (
          <div className="filtres__champs">
            <ChoixNiveau niveaux={niveaux} valeur={criteres.niveau} onChange={(niveau) => onChange({ niveau })} />
            <ChampSelect
              label={T.filiere}
              valeur={criteres.filiere}
              options={filieres}
              vide={T.toutesFilieres}
              disabled={!criteres.niveau}
              aide={!criteres.niveau ? T.filiereSansNiveau : undefined}
              onChange={(filiere) => onChange({ filiere })}
            />
            <ChampSelect
              label={T.matiere}
              valeur={criteres.matiere}
              options={matieres}
              vide={T.toutesMatieres}
              onChange={(matiere) => onChange({ matiere })}
            />
            <ChampSelect
              label={T.annee}
              valeur={criteres.annee}
              options={optionsAnnees}
              vide={T.toutesAnnees}
              onChange={(annee) => onChange({ annee })}
            />
            <ChampSelect
              label={T.type}
              valeur={criteres.type}
              options={types}
              vide={T.tousTypes}
              onChange={(type) => onChange({ type })}
            />
          </div>
        )}

        <button type="button" className="filtres__reinitialiser" onClick={onReinitialiser} disabled={nombreActifs === 0}>
          <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" />
          {T.reinitialiser}
        </button>
      </div>
    </aside>
  );
}

// -----------------------------------------------------------------------------
// Note : Graciel MBEMBA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
