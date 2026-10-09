// =============================================================================
// Espace formateur — widgets du tableau de bord
//   IconeMatiere        icône colorée selon la matière
//   GraphiqueSemaine    publications par jour (barres arrondies, hachurées si 0)
//   Jauge               demi-cercle : actifs téléchargeables / lecture seule / désactivés
//   Chronometre         chronomètre de session (pause, arrêt), conservé pendant la session
// =============================================================================
import { useEffect, useId, useState } from 'react';
import {
  BookOpenTextIcon,
  BrainIcon,
  ChartLineUpIcon,
  CodeIcon,
  FlaskIcon,
  GlobeHemisphereWestIcon,
  LeafIcon,
  MathOperationsIcon,
  PauseIcon,
  PlayIcon,
  ScalesIcon,
  StopIcon,
  TranslateIcon,
  BooksIcon
} from '@phosphor-icons/react';
import { indexJour } from '../tableauDeBord.content.js';

const MATIERES = {
  mathematiques: { icone: MathOperationsIcon, couleur: 1 },
  'physique-chimie': { icone: FlaskIcon, couleur: 2 },
  svt: { icone: LeafIcon, couleur: 2 },
  francais: { icone: BookOpenTextIcon, couleur: 4 },
  philosophie: { icone: BrainIcon, couleur: 4 },
  anglais: { icone: TranslateIcon, couleur: 1 },
  'histoire-geographie': { icone: GlobeHemisphereWestIcon, couleur: 3 },
  economie: { icone: ChartLineUpIcon, couleur: 3 },
  droit: { icone: ScalesIcon, couleur: 5 },
  informatique: { icone: CodeIcon, couleur: 5 }
};

export function IconeMatiere({ code, pastille = false }) {
  const { icone: Icone, couleur } = MATIERES[code] ?? { icone: BooksIcon, couleur: 1 };
  return (
    <span
      className={`tdb-matiere tdb-matiere--${couleur} ${pastille ? 'tdb-matiere--pastille' : ''}`}
      aria-hidden="true"
    >
      <Icone weight="fill" />
    </span>
  );
}

// Hauteurs des barres hachurées (jours sans publication) : décoratives, fixes.
const HAUTEURS_VIDES = [78, 70, 64, 74, 82, 62, 80];

export function GraphiqueSemaine({ jours }) {
  const aujourdhui = indexJour(new Date());
  const [survol, setSurvol] = useState(null);
  // Bulle par défaut : aujourd'hui s'il y a eu des publications, sinon le jour
  // le plus actif après le maximum (le maximum reste en vert foncé).
  const parDefaut =
    jours[aujourdhui].nombre > 0
      ? aujourdhui
      : (jours
          .map((j, i) => ({ ...j, i }))
          .filter((j) => j.nombre > 0 && !j.estMax)
          .sort((a, b) => b.nombre - a.nombre)[0]?.i ?? jours.findIndex((j) => j.estMax));
  const enAvant = survol ?? (parDefaut >= 0 ? parDefaut : aujourdhui);
  const max = Math.max(1, ...jours.map((j) => j.nombre));
  // Aucune publication : pas de bulle (un « 0 % » n'apprendrait rien).
  const aucune = jours.every((j) => j.nombre === 0);

  return (
    <ul className="tdb-barres" aria-label="Publications par jour de la semaine">
      {jours.map((jour, index) => {
        const vide = jour.nombre === 0;
        const hauteur = vide ? HAUTEURS_VIDES[index] : Math.max(62, Math.round((jour.nombre / max) * 100));
        const variante = vide ? 'hachuree' : jour.estMax ? 'foncee' : index === enAvant ? 'claire' : 'pleine';
        return (
          <li
            key={jour.nomJour}
            className="tdb-barres__jour"
            onMouseEnter={() => setSurvol(index)}
            onMouseLeave={() => setSurvol(null)}
          >
            <span className="tdb-barres__piste">
              <span
                className={`tdb-barres__barre tdb-barres__barre--${variante}`}
                style={{ height: `${hauteur}%` }}
              >
                {index === enAvant && !aucune && <span className="tdb-barres__bulle">{jour.pourcentage}%</span>}
              </span>
            </span>
            <span className="tdb-barres__libelle" aria-hidden="true">
              {jour.jour}
            </span>
            <span className="visually-hidden">
              {jour.nomJour} : {jour.nombre} publication{jour.nombre > 1 ? 's' : ''} ({jour.pourcentage} %)
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// Arc de cercle (centre 130,130, rayon 100) entre deux fractions de 0 (gauche) à 1 (droite).
function arc(debut, fin) {
  const point = (f) => {
    const angle = Math.PI * (1 - f);
    return `${(130 + 100 * Math.cos(angle)).toFixed(2)} ${(130 - 100 * Math.sin(angle)).toFixed(2)}`;
  };
  return `M ${point(debut)} A 100 100 0 0 1 ${point(fin)}`;
}

export function Jauge({ repartition, libelle }) {
  const idMotif = useId().replace(/:/g, '');
  const { total, telechargeables, lectureSeule } = repartition;
  // Petit écart entre segments ; les extrémités arrondies se chevauchent comme sur la maquette.
  const fVert = total ? telechargeables / total : 0;
  const fFonce = total ? lectureSeule / total : 0;
  const segments = [];
  if (fVert > 0) segments.push({ classe: 'vert', debut: 0, fin: fVert });
  if (fFonce > 0) segments.push({ classe: 'fonce', debut: fVert, fin: fVert + fFonce });

  return (
    <div className="tdb-jauge">
      <svg
        viewBox="0 0 260 150"
        role="img"
        aria-label={`${repartition.pourcentageActifs} % de livres actifs`}
      >
        <defs>
          <pattern
            id={idMotif}
            patternUnits="userSpaceOnUse"
            width="7"
            height="7"
            patternTransform="rotate(45)"
          >
            <rect width="7" height="7" className="tdb-jauge__fond-hachure" />
            <line x1="0" y1="0" x2="0" y2="7" className="tdb-jauge__hachure" />
          </pattern>
        </defs>
        <path d={arc(0, 1)} className="tdb-jauge__segment" stroke={`url(#${idMotif})`} />
        {segments
          .slice()
          .reverse()
          .map((s) => (
            <path
              key={s.classe}
              d={arc(s.debut, Math.min(1, s.fin))}
              className={`tdb-jauge__segment tdb-jauge__segment--${s.classe}`}
            />
          ))}
      </svg>
      <p className="tdb-jauge__valeur">
        {repartition.pourcentageActifs}%<span>{libelle}</span>
      </p>
    </div>
  );
}

// --- Chronomètre de session ------------------------------------------------------------
const CLE = 'scolaread:chronometre';

function lire() {
  try {
    const etat = JSON.parse(sessionStorage.getItem(CLE));
    if (etat && typeof etat.cumul === 'number') return etat;
  } catch {
    /* stockage indisponible : on repart de zéro */
  }
  return { cumul: 0, depuis: Date.now() }; // démarre à l'ouverture du tableau de bord
}

function ecrire(etat) {
  try {
    sessionStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    /* sans stockage, le chronomètre fonctionne quand même pendant la visite */
  }
}

const secondes = (etat) => Math.floor((etat.cumul + (etat.depuis ? Date.now() - etat.depuis : 0)) / 1000);
const deuxChiffres = (n) => String(n).padStart(2, '0');

export function Chronometre() {
  const [etat, setEtat] = useState(lire);
  const [, setTic] = useState(0);
  const enCours = etat.depuis !== null;

  useEffect(() => ecrire(etat), [etat]);
  useEffect(() => {
    if (!enCours) return undefined;
    const minuterie = setInterval(() => setTic((t) => t + 1), 1000);
    return () => clearInterval(minuterie);
  }, [enCours]);

  const total = secondes(etat);
  const affichage = `${deuxChiffres(Math.floor(total / 3600))}:${deuxChiffres(Math.floor((total % 3600) / 60))}:${deuxChiffres(total % 60)}`;

  const basculer = () =>
    setEtat((e) =>
      e.depuis ? { cumul: e.cumul + Date.now() - e.depuis, depuis: null } : { ...e, depuis: Date.now() }
    );
  const arreter = () => setEtat({ cumul: 0, depuis: null });

  return (
    <section className="tdb-carte tdb-chrono tdb-ondes" aria-labelledby="titre-chrono">
      <h2 id="titre-chrono" className="tdb-carte__titre tdb-chrono__titre">
        Chronomètre
      </h2>
      <p className="tdb-chrono__temps" aria-live="off">
        <time>{affichage}</time>
      </p>
      <div className="tdb-chrono__boutons">
        <button
          type="button"
          className="tdb-chrono__bouton"
          onClick={basculer}
          aria-label={enCours ? 'Mettre en pause' : 'Reprendre'}
        >
          {enCours ? (
            <PauseIcon weight="fill" aria-hidden="true" />
          ) : (
            <PlayIcon weight="fill" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="tdb-chrono__bouton tdb-chrono__bouton--stop"
          onClick={arreter}
          aria-label="Arrêter et remettre à zéro"
        >
          <StopIcon weight="fill" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
