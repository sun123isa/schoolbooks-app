// =============================================================================
// Page de recherche — pastilles des critères appliqués (retrait un par un)
// Responsable : Graciel MBEMBA — relecture : Salem KONGOLO
// BR07 : un critère n'est retiré que sur action de l'utilisateur.
// =============================================================================
import { XIcon } from '@phosphor-icons/react';
import { TEXTES } from '../recherche.content.js';

export function FiltresActifs({ actifs, onRetirer, onToutRetirer }) {
  if (actifs.length === 0) return null;

  return (
    <div className="actifs">
      <span className="actifs__label" id="criteres-actifs">
        {TEXTES.actifs.label}
      </span>
      <ul className="actifs__liste" aria-labelledby="criteres-actifs">
        {actifs.map((actif, index) => (
          <li key={actif.cle} style={{ '--i': index }}>
            <button
              type="button"
              className="actifs__pastille"
              onClick={() => onRetirer(actif.cle)}
              aria-label={TEXTES.actifs.retirer(actif.libelle)}
            >
              {actif.libelle}
              <XIcon weight="bold" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {actifs.length > 1 && (
        <button type="button" className="actifs__tout" onClick={onToutRetirer}>
          {TEXTES.actifs.toutRetirer}
        </button>
      )}
    </div>
  );
}
