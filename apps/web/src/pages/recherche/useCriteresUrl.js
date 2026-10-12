// =============================================================================
// Page de recherche — synchronisation des critères avec l'URL
// Responsable : Graciel MBEMBA — relecture : Salem KONGOLO
// L'URL est la source de vérité : une recherche se partage par lien, et les
// critères venant de la landing page (?niveau=&filiere=) sont repris tels quels.
// =============================================================================
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const CRITERES = ['q', 'niveau', 'filiere', 'matiere', 'annee', 'type', 'page', 'tri'];

export function useCriteresUrl() {
  const [searchParams, setSearchParams] = useSearchParams();

  const criteres = useMemo(
    () => Object.fromEntries(CRITERES.map((cle) => [cle, searchParams.get(cle) ?? undefined])),
    [searchParams]
  );

  // Met à jour un ou plusieurs critères. Tout changement de filtre ramène à la page 1 ;
  // changer de niveau efface la filière (BR02).
  const modifierCriteres = useCallback(
    (changements) => {
      setSearchParams((precedent) => {
        const suivant = new URLSearchParams(precedent);
        for (const [cle, valeur] of Object.entries(changements)) {
          if (valeur === undefined || valeur === null || valeur === '') suivant.delete(cle);
          else suivant.set(cle, String(valeur));
        }
        if ('niveau' in changements && !('filiere' in changements)) suivant.delete('filiere');
        if (!('page' in changements)) suivant.delete('page');
        return suivant;
      });
    },
    [setSearchParams]
  );

  return { criteres, modifierCriteres };
}
