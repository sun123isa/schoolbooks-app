// =============================================================================
// Socle frontend — célébration (carte de félicitations + confettis)
// Monté à la racine du routeur (router.jsx) : la carte reste affichée pendant
// la navigation qui suit l'action (ex. publication → « Mes livres »).
//   const celebrer = useCelebration();
//   celebrer({ icone: 'livre' | 'compte', titre, message, element, actions: [{ libelle, to }] });
// Accessibilité : <dialog> modal (focus piégé, Échap), confettis décoratifs
// désactivés si l'utilisateur préfère réduire les animations.
// =============================================================================
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  BookOpenTextIcon,
  ConfettiIcon,
  SparkleIcon,
  UserCircleCheckIcon,
  XIcon
} from '@phosphor-icons/react';
import { mouvementAutorise } from '../hooks/useMouvement.js';
import { lancerConfettis } from './confettis.js';
import './celebration.css';

const CelebrationContext = createContext(() => {});

const ICONES = { livre: BookOpenTextIcon, compte: UserCircleCheckIcon };

function CarteCelebration({ celebration, onFermer }) {
  const dialogue = useRef(null);
  const canvas = useRef(null);
  const Icone = ICONES[celebration.icone] ?? ConfettiIcon;

  useEffect(() => {
    dialogue.current?.showModal();
    if (!mouvementAutorise() || !canvas.current) return undefined;
    return lancerConfettis(canvas.current);
  }, []);

  return (
    <dialog
      ref={dialogue}
      className="celebration"
      aria-labelledby="celebration-titre"
      aria-describedby="celebration-message"
      onCancel={(event) => {
        event.preventDefault();
        onFermer();
      }}
      onClick={(event) => event.target === dialogue.current && onFermer()}
    >
      <canvas ref={canvas} className="celebration__confettis" aria-hidden="true" />
      <div className="celebration__carte">
        <button type="button" className="celebration__fermer" onClick={onFermer} aria-label="Fermer">
          <XIcon weight="bold" aria-hidden="true" />
        </button>

        <div className="celebration__bandeau" aria-hidden="true">
          <SparkleIcon weight="fill" className="celebration__etincelle celebration__etincelle--1" />
          <SparkleIcon weight="fill" className="celebration__etincelle celebration__etincelle--2" />
          <SparkleIcon weight="fill" className="celebration__etincelle celebration__etincelle--3" />
          <span className="celebration__medaille">
            <Icone weight="duotone" />
          </span>
        </div>

        <div className="celebration__corps">
          <p className="celebration__surtitre">
            <ConfettiIcon weight="fill" aria-hidden="true" /> Félicitations
          </p>
          <h2 id="celebration-titre" className="celebration__titre">
            {celebration.titre}
          </h2>
          <p id="celebration-message" className="celebration__message">
            {celebration.message}
          </p>
          {celebration.element && <p className="celebration__element">« {celebration.element} »</p>}

          <div className="celebration__actions">
            {(celebration.actions ?? []).map((action, index) => (
              <Link
                key={action.libelle}
                to={action.to}
                className={`celebration__bouton ${index === 0 ? 'celebration__bouton--principal' : ''}`}
                onClick={onFermer}
              >
                {action.libelle}
              </Link>
            ))}
            <button
              type="button"
              className={`celebration__bouton ${celebration.actions?.length ? '' : 'celebration__bouton--principal'}`}
              onClick={onFermer}
              autoFocus={!celebration.actions?.length}
            >
              {celebration.fermer ?? 'Continuer'}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

// Élément racine du routeur : fournit celebrer() à toutes les pages.
export function CelebrationRacine() {
  const [celebration, setCelebration] = useState(null);
  const celebrer = useCallback((details) => setCelebration({ ...details, cle: Date.now() }), []);

  return (
    <CelebrationContext.Provider value={celebrer}>
      <Outlet />
      {celebration && (
        <CarteCelebration
          key={celebration.cle}
          celebration={celebration}
          onFermer={() => setCelebration(null)}
        />
      )}
    </CelebrationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook indissociable du contexte.
export function useCelebration() {
  return useContext(CelebrationContext);
}
