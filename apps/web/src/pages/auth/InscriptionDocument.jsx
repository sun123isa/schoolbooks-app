// =============================================================================
// Inscription d'un élève au moment d'ouvrir un document pour la première fois
// Même gabarit que les autres pages de comptes, mais centré sur le document :
//   - à gauche, le document à débloquer et le parcours en 3 étapes ;
//   - à droite, un formulaire court : identité, niveau en pastilles, mot de
//     passe affichable avec critères vérifiés en direct.
// Après l'inscription, l'élève revient directement sur le document.
// =============================================================================
import { useId, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, EyeIcon, EyeSlashIcon, LockOpenIcon } from '@phosphor-icons/react';
import { MOT_DE_PASSE_MIN, ROLES } from '@schoolbooks/shared';
import { cheminConnexion } from '../../app/routes.js';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { fetchNiveauxScolaires } from '../../shared/auth/auth.api.js';
import { useApi } from '../../shared/hooks/useApi.js';
import { Alerte, Champ, erreursParChamp } from '../../shared/components/ui/Formulaire.jsx';
import { AuthLayout, Separateur } from './AuthLayout.jsx';
import { VisuelDocument } from './VisuelDocument.jsx';
import { celebrationInscription, destinationApresConnexion } from './auth.content.js';
import { useCelebration } from '../../shared/celebration/Celebration.jsx';
import './inscription-document.css';

const CRITERES = [
  { libelle: `${MOT_DE_PASSE_MIN} caractères minimum`, test: (v) => v.length >= MOT_DE_PASSE_MIN },
  { libelle: 'Une lettre', test: (v) => /[A-Za-z]/.test(v) },
  { libelle: 'Un chiffre', test: (v) => /[0-9]/.test(v) }
];

function ChampMotDePasse({ valeur, onChange, erreur }) {
  const [visible, setVisible] = useState(false);
  const idCriteres = useId();
  return (
    <Champ label="Mot de passe" erreur={erreur}>
      {(props) => (
        <>
          <div className="auth-mdp">
            <input
              {...props}
              type={visible ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Choisissez un mot de passe"
              value={valeur}
              onChange={onChange}
              aria-describedby={[props['aria-describedby'], idCriteres].filter(Boolean).join(' ')}
            />
            <button
              type="button"
              className="auth-mdp__oeil"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              aria-pressed={visible}
            >
              {visible ? (
                <EyeSlashIcon weight="bold" aria-hidden="true" />
              ) : (
                <EyeIcon weight="bold" aria-hidden="true" />
              )}
            </button>
          </div>
          <ul className="auth-criteres" id={idCriteres} aria-label="Exigences du mot de passe">
            {CRITERES.map((c) => {
              const ok = c.test(valeur);
              return (
                <li key={c.libelle} className={ok ? 'auth-criteres--ok' : ''}>
                  <span aria-hidden="true">{ok && <CheckIcon weight="bold" />}</span>
                  {c.libelle}
                  <span className="visually-hidden">{ok ? ' : respecté' : ' : non respecté'}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Champ>
  );
}

export function InscriptionDocument({ document }) {
  const { inscrire } = useAuth();
  const navigate = useNavigate();
  const celebrer = useCelebration();
  const location = useLocation();
  const niveaux = useApi((signal) => fetchNiveauxScolaires(signal), []);
  const [valeurs, setValeurs] = useState({ prenom: '', nom: '', email: '', niveau: '', motDePasse: '' });
  const [accepte, setAccepte] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const modifier = (champ) => (event) => setValeurs((v) => ({ ...v, [champ]: event.target.value }));
  const erreurs = erreursParChamp(erreur);
  const motDePasseValide = CRITERES.every((c) => c.test(valeurs.motDePasse));

  async function soumettre(event) {
    event.preventDefault();
    if (!valeurs.niveau) {
      setErreur({ code: 'LOCAL', details: [{ champ: 'niveau', message: 'Choisissez votre niveau.' }] });
      return;
    }
    if (!accepte) {
      setErreur({ code: 'CONDITIONS', message: "Veuillez accepter les conditions d'utilisation." });
      return;
    }
    setErreur(null);
    setEnvoi(true);
    try {
      const u = await inscrire(ROLES.apprenant, valeurs);
      celebrer(celebrationInscription(u, document));
      navigate(destinationApresConnexion(u, location.state), { replace: true });
    } catch (error) {
      setErreur(error);
      setEnvoi(false);
    }
  }

  return (
    <AuthLayout visuel={<VisuelDocument document={document} />}>
      <header className="auth__entete">
        <span className="auth-doc__badge">
          <LockOpenIcon weight="bold" aria-hidden="true" /> Accès gratuit
        </span>
        <h1 className="auth__titre">Plus qu’une étape.</h1>
        <p className="auth__sous-titre">
          Créez votre compte élève pour lire <strong className="auth-doc__cite">« {document.titre} »</strong>.
        </p>
        <span className="auth__trait" aria-hidden="true" />
      </header>
      <Separateur>Vos informations</Separateur>

      <form className="formulaire auth__formulaire" onSubmit={soumettre} noValidate>
        {erreur && !['CONDITIONS', 'LOCAL'].includes(erreur.code) && !Object.keys(erreurs).length && (
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

        <fieldset className="auth-niveaux">
          <legend className="form-champ__label">Votre niveau</legend>
          <div className="auth-niveaux__liste">
            {(niveaux.data ?? []).map((n) => (
              <label key={n.code} className="auth-niveau">
                <input
                  type="radio"
                  name="niveau"
                  value={n.code}
                  checked={valeurs.niveau === n.code}
                  onChange={modifier('niveau')}
                />
                <span>{n.libelle}</span>
              </label>
            ))}
            {niveaux.isLoading && <span className="auth-niveaux__chargement">Chargement…</span>}
          </div>
          {erreurs.niveau && <p className="form-champ__erreur">{erreurs.niveau}</p>}
        </fieldset>

        <ChampMotDePasse
          valeur={valeurs.motDePasse}
          onChange={modifier('motDePasse')}
          erreur={erreurs.motDePasse}
        />

        <label className="auth__case">
          <input type="checkbox" checked={accepte} onChange={(event) => setAccepte(event.target.checked)} />
          <span>
            J’accepte les <strong>conditions d’utilisation</strong> et le{' '}
            <strong>respect des droits d’auteur</strong> des documents
          </span>
        </label>
        {erreur?.code === 'CONDITIONS' && <p className="form-champ__erreur">{erreur.message}</p>}

        <button
          type="submit"
          className="auth__bouton auth__bouton--icone"
          disabled={envoi || !motDePasseValide}
        >
          {envoi ? 'Création du compte…' : 'Créer mon compte et lire'}
          {!envoi && <ArrowRightIcon weight="bold" aria-hidden="true" />}
        </button>
      </form>

      <p className="auth__pied">
        Déjà inscrit ?{' '}
        <Link to={cheminConnexion()} state={location.state}>
          Se connecter pour lire
        </Link>
      </p>
    </AuthLayout>
  );
}
