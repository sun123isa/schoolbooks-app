// =============================================================================
// Page de recherche — barre de recherche par mot-clé (critère q)
// Responsable : Graciel MBEMBA — relecture : Salem KONGOLO
// Soumise par la touche Entrée ou le bouton ; 100 caractères maximum (contrat).
// Le champ est réinitialisé quand le mot-clé de l'URL change (clé `valeur`).
// =============================================================================
import { useId, useState } from 'react';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { TEXTES } from '../recherche.content.js';

export function BarreRecherche({ valeur = '', onRechercher }) {
  const id = useId();
  const [saisie, setSaisie] = useState(valeur);

  const soumettre = (event) => {
    event.preventDefault();
    onRechercher(saisie.trim());
  };

  const effacer = () => {
    setSaisie('');
    onRechercher('');
  };

  return (
    <form role="search" className="barre-recherche" onSubmit={soumettre}>
      <label htmlFor={id} className="visually-hidden">
        {TEXTES.champ.label}
      </label>
      <MagnifyingGlassIcon className="barre-recherche__icone" weight="bold" aria-hidden="true" />
      <input
        id={id}
        type="search"
        name="q"
        maxLength={100}
        autoComplete="off"
        value={saisie}
        onChange={(event) => setSaisie(event.target.value)}
        placeholder={TEXTES.champ.placeholder}
        className="barre-recherche__champ"
      />
      {saisie && (
        <button type="button" className="barre-recherche__effacer" onClick={effacer} aria-label={TEXTES.champ.effacer}>
          <XIcon weight="bold" aria-hidden="true" />
        </button>
      )}
      <Button type="submit" className="barre-recherche__bouton">
        {TEXTES.champ.bouton}
      </Button>
    </form>
  );
}

// -----------------------------------------------------------------------------
// Note : Graciel MBEMBA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
