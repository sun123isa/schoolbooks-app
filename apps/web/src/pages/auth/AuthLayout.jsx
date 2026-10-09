// =============================================================================
// Pages de comptes — gabarit plein écran
// À gauche : visuel (mosaïque de photos en « S » de ScolaRead, formes
// décoratives, arguments selon le public) ; à droite : le formulaire.
// =============================================================================
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { ROUTES } from '../../app/routes.js';
import { LogoMark } from '../../shared/components/ui/Logo.jsx';
import photo1 from '../landing/assets/hero-etudiante.webp';
import photo2 from '../landing/assets/a-propos-groupe.webp';
import photo3 from '../landing/assets/nouveaute-diplomes.webp';
import photo4 from '../landing/assets/ressources-etudiant-ordinateur.webp';
import photo5 from '../landing/assets/a-propos-revision.webp';
import photo6 from '../landing/assets/nouveaute-examen.webp';
import photo7 from '../landing/assets/cta-etudiants-pelouse.webp';
import photo8 from '../landing/assets/nouveaute-lycee.webp';
import photo9 from '../landing/assets/nouveaute-exercices.webp';
import './auth.css';

// Cases de la mosaïque 3 × 3, lues en lignes ; leurs coins arrondis dessinent le « S ».
const MOSAIQUE = [photo1, photo2, photo3, photo4, photo9, photo5, photo6, photo7, photo8];

const ARGUMENTS = {
  apprenant: {
    question: (
      <>
        <strong>Pourquoi</strong> créer un compte ?
      </>
    ),
    points: [
      ['Lisez en ligne', 'les sujets, corrigés et livres'],
      ['Téléchargez', 'les documents autorisés'],
      ['Retrouvez', 'les ressources de votre niveau'],
      ['Gratuit', 'et sans engagement']
    ]
  },
  formateur: {
    question: (
      <>
        <strong>Pourquoi</strong> publier ici ?
      </>
    ),
    points: [
      ['Publiez', 'vos livres et supports PDF'],
      ['Suivez', 'vos téléchargements en temps réel'],
      ['Gérez', 'vos livres : modifier, désactiver, restaurer'],
      ['Touchez', 'les élèves de votre matière']
    ]
  }
};

// visuel : remplace la mosaïque et les arguments (ex. document à débloquer).
export function AuthLayout({ public: cible = 'apprenant', visuel, children }) {
  const { question, points } = ARGUMENTS[cible];
  return (
    <div className="auth">
      <aside
        className={`auth__visuel ${visuel ? 'auth__visuel--perso' : ''}`}
        aria-hidden={visuel ? undefined : true}
      >
        <span className="auth__forme auth__forme--1" />
        <span className="auth__forme auth__forme--2" />
        <span className="auth__forme auth__forme--3" />
        <span className="auth__forme auth__forme--4" />
        <span className="auth__forme auth__forme--5" />
        <span className="auth__forme auth__forme--6" />
        <span className="auth__forme auth__forme--7" />

        {visuel ?? (
          <>
            <div className="auth__mosaique">
              {MOSAIQUE.map((photo, index) => (
                <span key={index} className={`auth__case auth__case--${index}`}>
                  <img src={photo} alt="" loading="lazy" decoding="async" />
                </span>
              ))}
            </div>

            <div className="auth__accroche">
              <p className="auth__bienvenue">Bienvenue sur ScolaRead !</p>
              <p className="auth__question">{question}</p>
              <ul className="auth__points">
                {points.map(([fort, suite]) => (
                  <li key={fort}>
                    <strong>{fort}</strong> {suite}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </aside>

      <main className="auth__panneau">
        <div className="auth__barre">
          <Link to={ROUTES.accueil} className="auth__marque">
            <LogoMark className="auth__logo" />
            ScolaRead
          </Link>
          <Link to={ROUTES.accueil} className="auth__retour">
            <ArrowLeftIcon weight="bold" aria-hidden="true" /> Retour au site
          </Link>
        </div>
        <div className="auth__contenu">{children}</div>
      </main>
    </div>
  );
}

// Titre « Connexion. » + sous-titre + trait, comme la maquette.
export function AuthTitre({ titre, sousTitre }) {
  return (
    <header className="auth__entete">
      <h1 className="auth__titre">{titre}</h1>
      <p className="auth__sous-titre">{sousTitre}</p>
      <span className="auth__trait" aria-hidden="true" />
    </header>
  );
}

export function Separateur({ children }) {
  return (
    <p className="auth__separateur">
      <span>{children}</span>
    </p>
  );
}
