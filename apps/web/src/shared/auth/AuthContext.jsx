// =============================================================================
// Socle frontend — contexte d'authentification
// Restauration de session : au chargement, GET /api/auth/me (le client API
// tente un refresh si l'access token a expiré). Aucune donnée de session n'est
// stockée dans le navigateur en dehors des cookies HTTP-only posés par l'API.
//   const { utilisateur, pret, connecter, inscrire, deconnecter } = useAuth();
// =============================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EVENEMENT_SESSION_EXPIREE } from '../api/client.js';
import { connexion, deconnexion, fetchUtilisateurCourant, inscription } from './auth.api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchUtilisateurCourant(controller.signal)
      .then(setUtilisateur)
      .catch(() => setUtilisateur(null))
      .finally(() => {
        if (!controller.signal.aborted) setPret(true);
      });
    return () => controller.abort();
  }, []);

  // Refresh impossible pendant la navigation : on repasse en visiteur.
  useEffect(() => {
    const expirer = () => setUtilisateur(null);
    window.addEventListener(EVENEMENT_SESSION_EXPIREE, expirer);
    return () => window.removeEventListener(EVENEMENT_SESSION_EXPIREE, expirer);
  }, []);

  const connecter = useCallback(async (identifiants) => {
    const u = await connexion(identifiants);
    setUtilisateur(u);
    return u;
  }, []);

  const inscrire = useCallback(async (role, donnees) => {
    const u = await inscription(role, donnees);
    setUtilisateur(u);
    return u;
  }, []);

  const deconnecter = useCallback(async () => {
    try {
      await deconnexion();
    } finally {
      setUtilisateur(null);
    }
  }, []);

  const valeur = useMemo(
    () => ({ utilisateur, pret, connecter, inscrire, deconnecter }),
    [utilisateur, pret, connecter, inscrire, deconnecter]
  );
  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook indissociable du contexte.
export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return contexte;
}
