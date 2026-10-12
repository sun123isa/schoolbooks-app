// =============================================================================
// Socle frontend — éléments de formulaire (connexion, inscription, livres)
//   <Champ label="E-mail" erreur={erreurs.email} aide="…">{(props) => <input {...props} />}</Champ>
//   <Alerte type="erreur">Message</Alerte>
// Le libellé, l'aide et l'erreur sont reliés au contrôle (aria-describedby).
// =============================================================================
import { useId } from 'react';
import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react';
import './formulaires.css';

export function Champ({ label, erreur, aide, obligatoire = false, className = '', children }) {
  const id = useId();
  const idAide = aide ? `${id}-aide` : undefined;
  const idErreur = erreur ? `${id}-erreur` : undefined;

  return (
    <div className={`form-champ ${erreur ? 'form-champ--erreur' : ''} ${className}`.trim()}>
      <label htmlFor={id} className="form-champ__label">
        {label}
        {obligatoire && (
          <span className="form-champ__requis" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children({
        id,
        className: 'form-champ__controle',
        required: obligatoire,
        'aria-invalid': erreur ? true : undefined,
        'aria-describedby': [idAide, idErreur].filter(Boolean).join(' ') || undefined
      })}
      {aide && (
        <p id={idAide} className="form-champ__aide">
          {aide}
        </p>
      )}
      {erreur && (
        <p id={idErreur} className="form-champ__erreur">
          {erreur}
        </p>
      )}
    </div>
  );
}

export function Alerte({ type = 'erreur', children }) {
  const Icone = type === 'succes' ? CheckCircleIcon : WarningCircleIcon;
  return (
    <div className={`form-alerte form-alerte--${type}`} role={type === 'erreur' ? 'alert' : 'status'}>
      <Icone weight="fill" aria-hidden="true" className="form-alerte__icone" />
      <div>{children}</div>
    </div>
  );
}

// Erreurs de validation de l'API ({ champ, message }[]) → { champ: message }.
// eslint-disable-next-line react-refresh/only-export-components -- utilitaire lié aux formulaires.
export function erreursParChamp(error) {
  const resultat = {};
  for (const detail of error?.details ?? []) {
    if (detail.champ && !resultat[detail.champ]) resultat[detail.champ] = detail.message;
  }
  return resultat;
}
