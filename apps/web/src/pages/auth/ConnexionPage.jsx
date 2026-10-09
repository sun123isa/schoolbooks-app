// =============================================================================
// Page « /connexion » — apprenants et formateurs (même formulaire)
// ?role=formateur : visuel et liens adaptés aux formateurs (accès au tableau de bord).
// Après connexion : page demandée (state.depuis), sinon tableau de bord
// (formateur) ou catalogue des livres (apprenant).
// =============================================================================
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { cheminInscription } from '../../app/routes.js';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { Alerte, Champ, erreursParChamp } from '../../shared/components/ui/Formulaire.jsx';
import { Loader } from '../../shared/components/StatusMessages.jsx';
import { AuthLayout, AuthTitre, Separateur } from './AuthLayout.jsx';
import { destinationApresConnexion } from './auth.content.js';

export function ConnexionPage() {
  const { utilisateur, pret, connecter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const formateur = params.get('role') === 'formateur';
  const [valeurs, setValeurs] = useState({ email: '', motDePasse: '' });
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  if (!pret) return <Loader />;
  if (utilisateur && !envoi)
    return <Navigate to={destinationApresConnexion(utilisateur, location.state)} replace />;

  const modifier = (champ) => (event) => setValeurs((v) => ({ ...v, [champ]: event.target.value }));
  const erreurs = erreursParChamp(erreur);

  async function soumettre(event) {
    event.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      const u = await connecter(valeurs);
      navigate(destinationApresConnexion(u, location.state), { replace: true });
    } catch (error) {
      setErreur(error);
      setEnvoi(false);
    }
  }

  return (
    <AuthLayout public={formateur ? 'formateur' : 'apprenant'}>
      <AuthTitre
        titre="Connexion."
        sousTitre={
          formateur ? 'Accédez à votre tableau de bord formateur.' : 'Reprenez la lecture de vos documents.'
        }
      />
      <Separateur>Avec votre adresse e-mail</Separateur>

      <form className="formulaire auth__formulaire" onSubmit={soumettre} noValidate>
        {erreur && !Object.keys(erreurs).length && <Alerte>{erreur.message}</Alerte>}

        <Champ label="E-mail" erreur={erreurs.email}>
          {(props) => (
            <input
              {...props}
              type="email"
              autoComplete="email"
              placeholder="nom@exemple.com"
              value={valeurs.email}
              onChange={modifier('email')}
            />
          )}
        </Champ>
        <Champ label="Mot de passe" erreur={erreurs.motDePasse}>
          {(props) => (
            <input
              {...props}
              type="password"
              autoComplete="current-password"
              placeholder="Votre mot de passe"
              value={valeurs.motDePasse}
              onChange={modifier('motDePasse')}
            />
          )}
        </Champ>

        <button type="submit" className="auth__bouton" disabled={envoi}>
          {envoi ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="auth__pied">
        {formateur ? (
          <>
            Pas encore de compte formateur ?{' '}
            <Link to={cheminInscription('formateur')} state={location.state}>
              Créer un compte
            </Link>
          </>
        ) : (
          <>
            Pas encore de compte ?{' '}
            <Link to={cheminInscription()} state={location.state}>
              Inscrivez-vous gratuitement
            </Link>
          </>
        )}
      </p>
    </AuthLayout>
  );
}
