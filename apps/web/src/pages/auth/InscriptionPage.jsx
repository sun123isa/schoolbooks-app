// =============================================================================
// Page « /inscription » — création d'un compte
//   /inscription                 apprenant : on y arrive depuis un document ou un
//                                livre à lire (state.depuis, state.titre) ;
//   /inscription?role=formateur  formateur : accès au tableau de bord.
// L'inscription ouvre directement la session (cookies HTTP-only), puis ramène
// l'apprenant au document demandé et le formateur à son tableau de bord.
// =============================================================================
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { MOT_DE_PASSE_MIN, ROLES } from '@schoolbooks/shared';
import { ROUTES, cheminConnexion, cheminInscription } from '../../app/routes.js';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { fetchMatieresLivres, fetchNiveauxScolaires } from '../../shared/auth/auth.api.js';
import { useApi } from '../../shared/hooks/useApi.js';
import { Alerte, Champ, erreursParChamp } from '../../shared/components/ui/Formulaire.jsx';
import { Loader } from '../../shared/components/StatusMessages.jsx';
import { ListeDeroulante } from '../../shared/components/ui/ListeDeroulante.jsx';
import { AuthLayout, AuthTitre, Separateur } from './AuthLayout.jsx';
import { celebrationInscription, destinationApresConnexion } from './auth.content.js';
import { useCelebration } from '../../shared/celebration/Celebration.jsx';
import { InscriptionDocument } from './InscriptionDocument.jsx';

const VIDE = { prenom: '', nom: '', email: '', motDePasse: '', niveau: '', specialite: '' };

export function InscriptionPage() {
  const { utilisateur, pret, inscrire } = useAuth();
  const navigate = useNavigate();
  const celebrer = useCelebration();
  const location = useLocation();
  const [params] = useSearchParams();
  const formateur = params.get('role') === 'formateur';
  const role = formateur ? ROLES.formateur : ROLES.apprenant;
  const niveaux = useApi((signal) => fetchNiveauxScolaires(signal), []);
  const matieres = useApi((signal) => fetchMatieresLivres(signal), []);
  const [valeurs, setValeurs] = useState(VIDE);
  const [accepte, setAccepte] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  if (!pret) return <Loader />;
  if (utilisateur && !envoi)
    return <Navigate to={destinationApresConnexion(utilisateur, location.state)} replace />;
  // Élève arrivé depuis un document : parcours d'inscription dédié.
  if (!formateur && location.state?.document?.titre)
    return <InscriptionDocument document={location.state.document} />;

  const modifier = (champ) => (event) => setValeurs((v) => ({ ...v, [champ]: event.target.value }));
  const erreurs = erreursParChamp(erreur);
  const titreDocument = typeof location.state?.titre === 'string' ? location.state.titre : null;

  async function soumettre(event) {
    event.preventDefault();
    if (!accepte) {
      setErreur({ code: 'CONDITIONS', message: "Veuillez accepter les conditions d'utilisation." });
      return;
    }
    const { prenom, nom, email, motDePasse, niveau, specialite } = valeurs;
    const donnees = formateur
      ? { prenom, nom, email, motDePasse, specialite }
      : { prenom, nom, email, motDePasse, niveau };
    setErreur(null);
    setEnvoi(true);
    try {
      const u = await inscrire(role, donnees);
      celebrer(celebrationInscription(u));
      navigate(destinationApresConnexion(u, location.state), { replace: true });
    } catch (error) {
      setErreur(error);
      setEnvoi(false);
    }
  }

  return (
    <AuthLayout public={formateur ? 'formateur' : 'apprenant'}>
      <AuthTitre
        titre={formateur ? 'Espace formateur.' : 'Créer un compte.'}
        sousTitre={
          formateur
            ? 'Créez votre compte pour publier et gérer vos livres.'
            : titreDocument
              ? `Inscription gratuite pour lire « ${titreDocument} ».`
              : 'Inscription gratuite pour lire et télécharger les documents.'
        }
      />
      <Separateur>Avec votre adresse e-mail</Separateur>

      <form className="formulaire auth__formulaire" onSubmit={soumettre} noValidate>
        {erreur && erreur.code !== 'CONDITIONS' && !Object.keys(erreurs).length && (
          <Alerte>{erreur.message}</Alerte>
        )}

        <div className="formulaire__ligne">
          <Champ label="Prénom" erreur={erreurs.prenom}>
            {(props) => (
              <input
                {...props}
                autoComplete="given-name"
                value={valeurs.prenom}
                onChange={modifier('prenom')}
              />
            )}
          </Champ>
          <Champ label="Nom" erreur={erreurs.nom}>
            {(props) => (
              <input {...props} autoComplete="family-name" value={valeurs.nom} onChange={modifier('nom')} />
            )}
          </Champ>
        </div>

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

        {formateur ? (
          <Champ label="Matière enseignée" erreur={erreurs.specialite}>
            {(props) => (
              <ListeDeroulante
                {...props}
                options={(matieres.data ?? []).map((m) => ({ valeur: m.libelle, libelle: m.libelle }))}
                valeur={valeurs.specialite}
                onChange={(specialite) => setValeurs((v) => ({ ...v, specialite }))}
                placeholder={matieres.isLoading ? 'Chargement des matières…' : 'Choisir votre matière'}
                disabled={!matieres.data}
              />
            )}
          </Champ>
        ) : (
          <Champ label="Niveau" erreur={erreurs.niveau}>
            {(props) => (
              <ListeDeroulante
                {...props}
                options={(niveaux.data ?? []).map((n) => ({ valeur: n.code, libelle: n.libelle }))}
                valeur={valeurs.niveau}
                onChange={(niveau) => setValeurs((v) => ({ ...v, niveau }))}
                placeholder={niveaux.isLoading ? 'Chargement…' : 'Choisir votre niveau'}
                disabled={!niveaux.data}
              />
            )}
          </Champ>
        )}

        <Champ label="Mot de passe" erreur={erreurs.motDePasse}>
          {(props) => (
            <input
              {...props}
              type="password"
              autoComplete="new-password"
              placeholder={`${MOT_DE_PASSE_MIN} caractères minimum, lettres et chiffres`}
              value={valeurs.motDePasse}
              onChange={modifier('motDePasse')}
            />
          )}
        </Champ>

        <label className="auth__case">
          <input type="checkbox" checked={accepte} onChange={(event) => setAccepte(event.target.checked)} />
          <span>
            J’accepte les <strong>conditions d’utilisation</strong> et le{' '}
            <strong>respect des droits d’auteur</strong> des documents
          </span>
        </label>
        {erreur?.code === 'CONDITIONS' && <p className="form-champ__erreur">{erreur.message}</p>}

        <button type="submit" className="auth__bouton" disabled={envoi}>
          {envoi ? 'Création du compte…' : formateur ? 'Créer mon espace formateur' : 'Créer mon compte'}
        </button>
      </form>

      <p className="auth__pied">
        Déjà inscrit ?{' '}
        <Link to={cheminConnexion(formateur ? 'formateur' : undefined)} state={location.state}>
          Se connecter
        </Link>
        <br />
        {formateur ? (
          <>
            Vous êtes élève ou étudiant ? <Link to={ROUTES.livres}>Parcourir les livres</Link>
          </>
        ) : (
          <>
            Vous êtes formateur ? <Link to={cheminInscription('formateur')}>Créer un compte formateur</Link>
          </>
        )}
      </p>
    </AuthLayout>
  );
}
