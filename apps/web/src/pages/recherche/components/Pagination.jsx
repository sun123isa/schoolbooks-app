// =============================================================================
// Page de recherche — pagination (précédente, numéros, suivante)
// Responsable : Graciel MBEMBA — relecture : Salem KONGOLO
// Masquée s'il n'y a qu'une page. La page courante porte aria-current.
// =============================================================================
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { TEXTES, pagesAffichees } from '../recherche.content.js';

const T = TEXTES.pagination;

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label={T.label}>
      <button
        type="button"
        className="pagination__bouton"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label={T.precedente}
      >
        <CaretLeftIcon weight="bold" aria-hidden="true" />
      </button>
      <ul className="pagination__pages">
        {pagesAffichees(page, totalPages).map((numero, index) =>
          numero === '…' ? (
            <li key={`trou-${index}`} className="pagination__trou" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={numero}>
              <button
                type="button"
                className="pagination__bouton"
                aria-current={numero === page ? 'page' : undefined}
                aria-label={T.page(numero)}
                onClick={() => onChange(numero)}
              >
                {numero}
              </button>
            </li>
          )
        )}
      </ul>
      <button
        type="button"
        className="pagination__bouton"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label={T.suivante}
      >
        <CaretRightIcon weight="bold" aria-hidden="true" />
      </button>
    </nav>
  );
}

// -----------------------------------------------------------------------------
// Note : Graciel MBEMBA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
