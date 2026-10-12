// =============================================================================
// Socle frontend — liste déroulante du site (remplace <select> et <datalist>)
// Bouton + liste d'options dessinés par le site (et non par le navigateur),
// selon le modèle ARIA « listbox à sélection unique » :
//   - souris : clic pour ouvrir, clic sur une option, clic à l'extérieur pour fermer ;
//   - clavier : ↓ ↑ Entrée Espace pour ouvrir, ↓ ↑ Début Fin pour naviguer,
//     Entrée / Espace pour choisir, Échap pour fermer, une lettre pour sauter
//     à l'option correspondante.
// Usage dans <Champ> : {(props) => <ListeDeroulante {...props} options={…} valeur={v} onChange={setV} />}
// =============================================================================
import { useEffect, useId, useRef, useState } from 'react';
import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react';
import './liste-deroulante.css';

const normaliser = (texte) =>
  texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function ListeDeroulante({
  id,
  options,
  valeur,
  onChange,
  placeholder = 'Choisir…',
  disabled = false,
  className = '',
  variante = 'site',
  'aria-invalid': invalide,
  'aria-describedby': decritPar
}) {
  const idListe = useId();
  const racine = useRef(null);
  const liste = useRef(null);
  const bouton = useRef(null);
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(-1);
  const choisie = options.find((o) => o.valeur === valeur);

  const ouvrir = (index = options.findIndex((o) => o.valeur === valeur)) => {
    if (disabled || options.length === 0) return;
    setActif(index >= 0 ? index : 0);
    setOuvert(true);
  };
  const fermer = (rendreFocus = true) => {
    setOuvert(false);
    if (rendreFocus) bouton.current?.focus();
  };
  const choisir = (index) => {
    const option = options[index];
    if (!option) return;
    onChange(option.valeur);
    fermer();
  };

  // À l'ouverture, le focus passe sur la liste (lecteurs d'écran : option active annoncée).
  useEffect(() => {
    if (ouvert) liste.current?.focus();
  }, [ouvert]);

  // L'option active reste visible quand on navigue au clavier.
  useEffect(() => {
    if (ouvert && actif >= 0) liste.current?.children[actif]?.scrollIntoView({ block: 'nearest' });
  }, [ouvert, actif]);

  // Clic à l'extérieur : fermeture sans reprendre le focus.
  useEffect(() => {
    if (!ouvert) return undefined;
    const exterieur = (event) => {
      if (!racine.current?.contains(event.target)) setOuvert(false);
    };
    document.addEventListener('mousedown', exterieur);
    return () => document.removeEventListener('mousedown', exterieur);
  }, [ouvert]);

  function toucheBouton(event) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      ouvrir();
    }
  }

  function toucheListe(event) {
    const dernier = options.length - 1;
    const actions = {
      ArrowDown: () => setActif((i) => Math.min(dernier, i + 1)),
      ArrowUp: () => setActif((i) => Math.max(0, i - 1)),
      Home: () => setActif(0),
      End: () => setActif(dernier),
      Enter: () => choisir(actif),
      ' ': () => choisir(actif),
      Escape: () => fermer(),
      Tab: () => fermer(false)
    };
    if (actions[event.key]) {
      if (event.key !== 'Tab') event.preventDefault();
      actions[event.key]();
      return;
    }
    // Saisie d'une lettre : première option suivante qui commence par cette lettre.
    if (event.key.length === 1 && /\S/.test(event.key)) {
      const lettre = normaliser(event.key);
      const ordre = [...options.slice(actif + 1), ...options.slice(0, actif + 1)];
      const trouvee = ordre.find((o) => normaliser(o.libelle).startsWith(lettre));
      if (trouvee) setActif(options.indexOf(trouvee));
    }
  }

  return (
    <div
      ref={racine}
      className={`liste liste--${variante} ${ouvert ? 'liste--ouverte' : ''} ${className}`.trim()}
    >
      <button
        ref={bouton}
        id={id}
        type="button"
        className={`liste__bouton ${choisie ? '' : 'liste__bouton--vide'}`}
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        aria-controls={idListe}
        aria-invalid={invalide}
        aria-describedby={decritPar}
        disabled={disabled}
        onClick={() => (ouvert ? fermer() : ouvrir())}
        onKeyDown={toucheBouton}
      >
        {choisie?.icone && <span className="liste__icone">{choisie.icone}</span>}
        <span className="liste__valeur">{choisie ? choisie.libelle : placeholder}</span>
        <CaretDownIcon className="liste__chevron" weight="bold" aria-hidden="true" />
      </button>

      {ouvert && (
        <ul
          ref={liste}
          id={idListe}
          role="listbox"
          tabIndex={-1}
          className="liste__options"
          aria-labelledby={id}
          aria-activedescendant={actif >= 0 ? `${idListe}-${actif}` : undefined}
          onKeyDown={toucheListe}
        >
          {options.map((option, index) => (
            <li
              key={option.valeur}
              id={`${idListe}-${index}`}
              role="option"
              aria-selected={option.valeur === valeur}
              className={`liste__option ${index === actif ? 'liste__option--active' : ''}`}
              onMouseEnter={() => setActif(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choisir(index)}
            >
              {option.icone && <span className="liste__icone">{option.icone}</span>}
              <span className="liste__libelle">{option.libelle}</span>
              {option.valeur === valeur && (
                <CheckIcon className="liste__coche" weight="bold" aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
