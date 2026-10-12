// =============================================================================
// Socle frontend — hook de chargement de données
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Usage : const { data, isLoading, error, reload } = useApi((signal) => fetchX(a, signal), [a]);
// `deps` : valeurs simples (chaînes, nombres) qui déclenchent un nouveau chargement.
// Annule la requête précédente quand les dépendances changent (pas de résultat
// obsolète affiché quand l'utilisateur change vite de filtre).
// =============================================================================
import { useCallback, useEffect, useState } from 'react';

export function useApi(loader, deps) {
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  // Clé de la requête courante : le résultat affiché n'est valable que pour cette clé.
  const cle = JSON.stringify([...deps, version]);
  const [resultat, setResultat] = useState({ cle: null, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResultat({ cle, data, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResultat({ cle, data: null, error });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `cle` résume les dépendances fournies.
  }, [cle]);

  const isLoading = resultat.cle !== cle;
  return {
    data: isLoading ? null : resultat.data,
    error: isLoading ? null : resultat.error,
    isLoading,
    reload
  };
}
