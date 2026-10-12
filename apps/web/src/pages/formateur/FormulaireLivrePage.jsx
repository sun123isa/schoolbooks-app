// =============================================================================
// Pages « /formateur/livres/nouveau » et « /formateur/livres/:id/modifier »
// Formulaire en deux colonnes, dans le style du tableau de bord :
//   gauche  : 1. fichier PDF (glisser-déposer, miniature de la 1re page)
//             2. informations (titre, auteur, description, compteurs)
//             3. classement (niveau, série/filière, matière, type, année en pastilles)
//   droite  : aperçu de la carte du catalogue, progression, publication
//             (téléchargement autorisé, droits d'utilisation).
// Règles : filières du niveau choisi (BR02), année exigée par certains types
// (BR04), PDF ≤ 25 Mo. L'API revérifie tout (signature PDF, doublon, référentiels).
// =============================================================================
import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  CircleIcon,
  CloudArrowUpIcon,
  DownloadSimpleIcon,
  EyeIcon,
  FloppyDiskIcon,
  TrashIcon,
  UploadSimpleIcon,
  UserIcon
} from '@phosphor-icons/react';
import { TAILLE_MAX_PDF } from '@schoolbooks/shared';
import { ROUTES, cheminLivre } from '../../app/routes.js';
import { useApi } from '../../shared/hooks/useApi.js';
import { fetchMatieresLivres, fetchNiveauxScolaires } from '../../shared/auth/auth.api.js';
import { ErrorMessage, Loader } from '../../shared/components/StatusMessages.jsx';
import { Alerte, erreursParChamp } from '../../shared/components/ui/Formulaire.jsx';
import { ListeDeroulante } from '../../shared/components/ui/ListeDeroulante.jsx';
import { fetchLivre } from '../livres/livres.api.js';
import { useCelebration } from '../../shared/celebration/Celebration.jsx';
import { creerLivre, fetchTypesDocuments, modifierLivre } from './formateur.api.js';
import { IconeMatiere } from './components/Widgets.jsx';
import { MiniaturePdf } from './components/MiniaturePdf.jsx';
import './formulaire-livre.css';

const VIDE = {
  titre: '',
  auteur: '',
  description: '',
  niveau: '',
  filiere: '',
  matiere: '',
  type: 'livre',
  annee: '',
  telechargeable: true,
  droits: ''
};

const MO = 1024 * 1024;
const formatTaille = (octets) =>
  octets < MO ? `${Math.max(1, Math.round(octets / 1024))} Ko` : `${(octets / MO).toFixed(1)} Mo`;

function depuisLivre(livre) {
  return {
    titre: livre.titre,
    auteur: livre.auteur ?? '',
    description: livre.description ?? '',
    niveau: livre.niveau.code,
    filiere: livre.filiere?.code ?? '',
    matiere: livre.matiere.code,
    type: livre.type.code,
    annee: livre.annee ? String(livre.annee) : '',
    telechargeable: livre.telechargeable,
    droits: livre.droits ?? ''
  };
}

// Vérifie le fichier choisi côté navigateur ; renvoie un message d'erreur ou null.
function controlerFichier(fichier) {
  if (!/\.pdf$/i.test(fichier.name) && fichier.type !== 'application/pdf')
    return 'Seuls les fichiers PDF sont acceptés.';
  if (fichier.size > TAILLE_MAX_PDF) return `Le fichier dépasse ${TAILLE_MAX_PDF / MO} Mo.`;
  return null;
}

function Carte({ numero, titre, aide, children }) {
  const id = useId();
  return (
    <section className="fl-carte" aria-labelledby={id}>
      <header className="fl-carte__entete">
        {numero && <span className="fl-carte__numero">{numero}</span>}
        <div>
          <h2 id={id} className="fl-carte__titre">
            {titre}
          </h2>
          {aide && <p className="fl-carte__aide">{aide}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function Champ({ label, erreur, aide, compteur, max, obligatoire, children }) {
  const id = useId();
  return (
    <div className={`fl-champ ${erreur ? 'fl-champ--erreur' : ''}`}>
      <div className="fl-champ__haut">
        <label htmlFor={id} className="fl-champ__label">
          {label}
          {obligatoire && <span aria-hidden="true"> *</span>}
        </label>
        {max && (
          <span className="fl-champ__compteur" aria-live="polite">
            {compteur}/{max}
          </span>
        )}
      </div>
      {children({
        id,
        'aria-invalid': erreur ? true : undefined,
        'aria-describedby': erreur || aide ? `${id}-info` : undefined
      })}
      {(erreur || aide) && (
        <p id={`${id}-info`} className={erreur ? 'fl-champ__erreur' : 'fl-champ__aide'}>
          {erreur ?? aide}
        </p>
      )}
    </div>
  );
}

// Choix unique en pastilles (radio accessibles).
function Pastilles({ legende, nom, options, valeur, onChange, erreur, desactive }) {
  return (
    <fieldset className={`fl-pastilles ${erreur ? 'fl-champ--erreur' : ''}`} disabled={desactive}>
      <legend className="fl-champ__label">{legende}</legend>
      <div className="fl-pastilles__liste">
        {options.map((o) => (
          <label key={o.code || 'aucun'} className="fl-pastille">
            <input
              type="radio"
              name={nom}
              value={o.code}
              checked={valeur === o.code}
              onChange={() => onChange(o.code)}
            />
            <span>{o.libelle}</span>
          </label>
        ))}
      </div>
      {erreur && <p className="fl-champ__erreur">{erreur}</p>}
    </fieldset>
  );
}

function ZoneDepot({ fichier, livre, infos, erreur, onChoisir, onRetirer, setInfos }) {
  const champ = useRef(null);
  const [survol, setSurvol] = useState(false);
  const urlActuelle = livre?.urls?.fichier ?? null;

  const deposer = (event) => {
    event.preventDefault();
    setSurvol(false);
    const choisi = event.dataTransfer.files?.[0];
    if (choisi) onChoisir(choisi);
  };

  const source = fichier ? { fichier } : urlActuelle ? { url: urlActuelle } : null;

  return (
    <div>
      {source ? (
        <div className="fl-fichier">
          <MiniaturePdf
            key={fichier ? `${fichier.name}-${fichier.size}` : urlActuelle}
            {...source}
            largeur={96}
            onInfos={setInfos}
          />
          <div className="fl-fichier__texte">
            <span className="fl-fichier__badge">{fichier ? 'Nouveau fichier' : 'Fichier actuel'}</span>
            <strong>{fichier ? fichier.name : 'PDF publié'}</strong>
            <span>
              {fichier
                ? formatTaille(fichier.size)
                : livre?.tailleOctets
                  ? formatTaille(livre.tailleOctets)
                  : ''}
              {infos?.pages ? ` · ${infos.pages} page${infos.pages > 1 ? 's' : ''}` : ''}
              {infos?.erreur ? ' · aperçu indisponible' : ''}
            </span>
            <div className="fl-fichier__actions">
              <button type="button" onClick={() => champ.current?.click()}>
                <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" /> Remplacer
              </button>
              {fichier && (
                <button type="button" className="fl-fichier__retirer" onClick={onRetirer}>
                  <TrashIcon weight="bold" aria-hidden="true" /> Retirer
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`fl-depot ${survol ? 'fl-depot--survol' : ''} ${erreur ? 'fl-depot--erreur' : ''}`}
          onClick={() => champ.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setSurvol(true);
          }}
          onDragLeave={() => setSurvol(false)}
          onDrop={deposer}
        >
          <span className="fl-depot__icone" aria-hidden="true">
            <CloudArrowUpIcon weight="duotone" />
          </span>
          <span className="fl-depot__titre">
            Glissez-déposez votre PDF ici, ou <u>parcourez vos fichiers</u>
          </span>
          <span className="fl-depot__aide">PDF uniquement · {TAILLE_MAX_PDF / MO} Mo maximum</span>
        </button>
      )}
      <input
        ref={champ}
        type="file"
        accept="application/pdf,.pdf"
        className="visually-hidden"
        tabIndex={-1}
        aria-label="Choisir le fichier PDF"
        onChange={(event) => {
          const choisi = event.target.files?.[0];
          event.target.value = '';
          if (choisi) onChoisir(choisi);
        }}
      />
      {erreur && <p className="fl-champ__erreur">{erreur}</p>}
    </div>
  );
}

function Formulaire({ livre }) {
  const navigate = useNavigate();
  const { mesLivres, utilisateur } = useOutletContext();
  const celebrer = useCelebration();
  const edition = Boolean(livre);
  const niveaux = useApi((signal) => fetchNiveauxScolaires(signal), []);
  const matieres = useApi((signal) => fetchMatieresLivres(signal), []);
  const types = useApi((signal) => fetchTypesDocuments(signal), []);
  const [valeurs, setValeurs] = useState(() => (livre ? depuisLivre(livre) : VIDE));
  const [fichier, setFichier] = useState(null);
  const [infosPdf, setInfosPdf] = useState(null);
  const [erreurs, setErreurs] = useState({});
  const [erreurApi, setErreurApi] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const niveau = niveaux.data?.find((n) => n.code === valeurs.niveau);
  const filieres = niveau?.filieres ?? [];
  const type = types.data?.find((t) => t.code === valeurs.type);
  const anneeRequise = Boolean(type?.requiertAnnee);
  const matiere = matieres.data?.find((m) => m.code === valeurs.matiere);

  const fixer = (champ, valeur) => {
    setValeurs((v) => ({ ...v, [champ]: valeur, ...(champ === 'niveau' ? { filiere: '' } : {}) }));
    setErreurs((e) => ({ ...e, [champ]: undefined }));
  };
  const modifier = (champ) => (event) => fixer(champ, event.target.value);

  function choisirFichier(choisi) {
    const probleme = controlerFichier(choisi);
    setErreurs((e) => ({ ...e, fichier: probleme ?? undefined }));
    if (probleme) return;
    setInfosPdf(null);
    setFichier(choisi);
    // Titre proposé à partir du nom du fichier s'il est encore vide.
    if (!valeurs.titre.trim()) {
      const propose = choisi.name
        .replace(/\.pdf$/i, '')
        .replace(/[_-]+/g, ' ')
        .trim();
      if (propose.length >= 3) fixer('titre', propose.charAt(0).toUpperCase() + propose.slice(1));
    }
  }

  // Étapes de la progression (et contrôles avant envoi).
  const etapes = [
    { cle: 'fichier', libelle: 'Fichier PDF', ok: edition || Boolean(fichier) },
    { cle: 'titre', libelle: 'Titre', ok: valeurs.titre.trim().length >= 3 },
    { cle: 'niveau', libelle: 'Niveau', ok: Boolean(valeurs.niveau) },
    { cle: 'matiere', libelle: 'Matière', ok: Boolean(valeurs.matiere) },
    ...(anneeRequise ? [{ cle: 'annee', libelle: 'Année', ok: /^\d{4}$/.test(valeurs.annee) }] : [])
  ];
  const faites = etapes.filter((e) => e.ok).length;
  const progression = Math.round((faites / etapes.length) * 100);

  async function soumettre(event) {
    event.preventDefault();
    const manquants = {};
    for (const e of etapes) {
      if (!e.ok)
        manquants[e.cle] = e.cle === 'titre' ? 'Au moins 3 caractères.' : `${e.libelle} obligatoire.`;
    }
    if (Object.keys(manquants).length) {
      setErreurs(manquants);
      document
        .querySelector('.fl-champ--erreur, .fl-depot--erreur')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const formulaire = new FormData();
    for (const [cle, valeur] of Object.entries(valeurs)) {
      // Création : champs vides omis ; modification : une chaîne vide efface le champ.
      if (!edition && valeur === '') continue;
      formulaire.append(cle, typeof valeur === 'boolean' ? String(valeur) : valeur.trim());
    }
    if (fichier) formulaire.append('fichier', fichier);

    setErreurApi(null);
    setEnvoi(true);
    try {
      const resultat = edition ? await modifierLivre(livre.id, formulaire) : await creerLivre(formulaire);
      mesLivres.reload();
      if (edition) {
        navigate(ROUTES.mesLivres, { state: { message: `« ${resultat.titre} » a été mis à jour.` } });
      } else {
        celebrer({
          icone: 'livre',
          titre: 'Votre livre est en ligne !',
          message:
            'Bravo : il est déjà visible dans le catalogue et dans la recherche. Les élèves inscrits peuvent le lire dès maintenant.',
          element: resultat.titre,
          actions: [
            { libelle: 'Voir mon livre', to: cheminLivre(resultat.id) },
            { libelle: 'Publier un autre livre', to: ROUTES.nouveauLivre }
          ],
          fermer: 'Retour à mes livres'
        });
        navigate(ROUTES.mesLivres);
      }
    } catch (error) {
      setErreurApi(error);
      setErreurs(erreursParChamp(error));
      setEnvoi(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const pastillesNiveaux = (niveaux.data ?? []).map((n) => ({ code: n.code, libelle: n.libelle }));
  const pastillesTypes = (types.data ?? [{ code: 'livre', libelle: 'Livre' }]).map((t) => ({
    code: t.code,
    libelle: t.libelle
  }));
  const anneeCourante = new Date().getFullYear();

  return (
    <form className="fl" onSubmit={soumettre} noValidate>
      <header className="tdb-entete fl__entete">
        <div>
          <p className="fl__fil">
            <Link to={ROUTES.mesLivres}>Mes livres</Link> / {edition ? 'Modifier' : 'Nouveau livre'}
          </p>
          <h1 className="tdb-entete__titre">{edition ? 'Modifier le livre' : 'Ajouter un livre'}</h1>
          <p className="tdb-entete__intro">
            {edition
              ? 'Mettez à jour les informations ; déposez un nouveau PDF seulement pour remplacer l’actuel.'
              : 'Déposez votre PDF, décrivez-le et classez-le : il sera visible tout de suite dans le catalogue.'}
          </p>
        </div>
        <div className="tdb-entete__actions">
          <Link to={ROUTES.mesLivres} className="tdb-bouton tdb-bouton--contour">
            Annuler
          </Link>
          <button type="submit" className="tdb-bouton tdb-bouton--plein" disabled={envoi}>
            {edition ? (
              <FloppyDiskIcon weight="bold" aria-hidden="true" />
            ) : (
              <UploadSimpleIcon weight="bold" aria-hidden="true" />
            )}
            {envoi ? 'Enregistrement…' : edition ? 'Enregistrer' : 'Publier le livre'}
          </button>
        </div>
      </header>

      {erreurApi && !Object.keys(erreursParChamp(erreurApi)).length && <Alerte>{erreurApi.message}</Alerte>}

      <div className="fl__grille">
        <div className="fl__principal">
          <Carte numero="1" titre="Fichier PDF" aide="Le document que liront les élèves.">
            <ZoneDepot
              fichier={fichier}
              livre={livre}
              infos={infosPdf}
              erreur={erreurs.fichier}
              onChoisir={choisirFichier}
              onRetirer={() => {
                setFichier(null);
                setInfosPdf(null);
              }}
              setInfos={setInfosPdf}
            />
          </Carte>

          <Carte numero="2" titre="Informations" aide="Un titre clair aide les élèves à trouver votre livre.">
            <div className="fl__champs">
              <Champ
                label="Titre"
                obligatoire
                erreur={erreurs.titre}
                compteur={valeurs.titre.length}
                max={255}
              >
                {(props) => (
                  <input
                    {...props}
                    className="fl-input"
                    maxLength={255}
                    placeholder="Ex. : Algèbre linéaire — Terminale C"
                    value={valeurs.titre}
                    onChange={modifier('titre')}
                  />
                )}
              </Champ>
              <Champ label="Auteur" erreur={erreurs.auteur} aide="Laissez vide si vous en êtes l’auteur.">
                {(props) => (
                  <input
                    {...props}
                    className="fl-input"
                    maxLength={255}
                    placeholder={`${utilisateur.prenom} ${utilisateur.nom}`}
                    value={valeurs.auteur}
                    onChange={modifier('auteur')}
                  />
                )}
              </Champ>
              <Champ
                label="Description"
                erreur={erreurs.description}
                compteur={valeurs.description.length}
                max={5000}
              >
                {(props) => (
                  <textarea
                    {...props}
                    className="fl-input fl-input--zone"
                    rows={4}
                    maxLength={5000}
                    placeholder="Contenu, chapitres, public visé…"
                    value={valeurs.description}
                    onChange={modifier('description')}
                  />
                )}
              </Champ>
            </div>
          </Carte>

          <Carte numero="3" titre="Classement" aide="Détermine où le livre apparaît dans la recherche.">
            <div className="fl__champs">
              <Pastilles
                legende="Niveau *"
                nom="niveau"
                options={pastillesNiveaux}
                valeur={valeurs.niveau}
                onChange={(c) => fixer('niveau', c)}
                erreur={erreurs.niveau}
              />
              {valeurs.niveau && filieres.length > 0 && (
                <Pastilles
                  legende="Série / filière"
                  nom="filiere"
                  options={[
                    { code: '', libelle: 'Tout le niveau' },
                    ...filieres.map((f) => ({ code: f.code, libelle: f.libelle.split(' — ')[0] }))
                  ]}
                  valeur={valeurs.filiere}
                  onChange={(c) => fixer('filiere', c)}
                  erreur={erreurs.filiere}
                />
              )}
              <Pastilles
                legende="Type de document"
                nom="type"
                options={pastillesTypes}
                valeur={valeurs.type}
                onChange={(c) => fixer('type', c)}
                erreur={erreurs.type}
              />
              <div className="fl__ligne">
                <Champ label="Matière" obligatoire erreur={erreurs.matiere}>
                  {(props) => (
                    <ListeDeroulante
                      {...props}
                      variante="tdb"
                      options={(matieres.data ?? []).map((m) => ({
                        valeur: m.code,
                        libelle: m.libelle,
                        icone: <IconeMatiere code={m.code} />
                      }))}
                      valeur={valeurs.matiere}
                      onChange={(code) => fixer('matiere', code)}
                      placeholder={matieres.isLoading ? 'Chargement…' : 'Choisir une matière'}
                      disabled={!matieres.data}
                    />
                  )}
                </Champ>
                <Champ
                  label="Année"
                  obligatoire={anneeRequise}
                  erreur={erreurs.annee}
                  aide={anneeRequise ? `Obligatoire pour « ${type.libelle} ».` : 'Facultatif.'}
                >
                  {(props) => (
                    <input
                      {...props}
                      className="fl-input"
                      type="number"
                      inputMode="numeric"
                      min={1950}
                      max={2100}
                      placeholder={String(anneeCourante)}
                      value={valeurs.annee}
                      onChange={modifier('annee')}
                    />
                  )}
                </Champ>
              </div>
            </div>
          </Carte>
        </div>

        <aside className="fl__lateral">
          <section className="fl-carte fl-apercu" aria-label="Aperçu dans le catalogue">
            <p className="fl-apercu__surtitre">
              <EyeIcon weight="bold" aria-hidden="true" /> Aperçu dans le catalogue
            </p>
            <div className="fl-apercu__carte">
              <IconeMatiere code={valeurs.matiere} pastille />
              <div className="fl-apercu__texte">
                <strong>{valeurs.titre.trim() || 'Titre du livre'}</strong>
                <span>
                  <UserIcon weight="bold" aria-hidden="true" />{' '}
                  {valeurs.auteur.trim() || `${utilisateur.prenom} ${utilisateur.nom}`}
                </span>
                <span className="fl-apercu__pastilles">
                  <span>{niveau?.libelle ?? 'Niveau'}</span>
                  <span>{matiere?.libelle ?? 'Matière'}</span>
                  {valeurs.annee && <span>{valeurs.annee}</span>}
                </span>
              </div>
            </div>
          </section>

          <section className="fl-carte" aria-labelledby="fl-progression">
            <div className="fl-progression__haut">
              <h2 id="fl-progression" className="fl-carte__titre">
                Progression
              </h2>
              <span className="fl-progression__valeur">{progression}%</span>
            </div>
            <div
              className="fl-progression__barre"
              role="progressbar"
              aria-valuenow={progression}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-labelledby="fl-progression"
            >
              <span style={{ width: `${progression}%` }} />
            </div>
            <ul className="fl-etapes">
              {etapes.map((e) => (
                <li key={e.cle} className={e.ok ? 'fl-etapes--ok' : ''}>
                  {e.ok ? (
                    <CheckCircleIcon weight="fill" aria-hidden="true" />
                  ) : (
                    <CircleIcon weight="bold" aria-hidden="true" />
                  )}
                  {e.libelle}
                  <span className="visually-hidden">{e.ok ? ' : complété' : ' : à compléter'}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="fl-carte" aria-labelledby="fl-publication">
            <h2 id="fl-publication" className="fl-carte__titre">
              Publication
            </h2>
            <label className="fl-interrupteur">
              <span className="fl-interrupteur__texte">
                <strong>
                  <DownloadSimpleIcon weight="bold" aria-hidden="true" /> Téléchargement autorisé
                </strong>
                <span>
                  {valeurs.telechargeable
                    ? 'Les élèves inscrits peuvent enregistrer le PDF.'
                    : 'Lecture en ligne uniquement.'}
                </span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={valeurs.telechargeable}
                onChange={(event) => fixer('telechargeable', event.target.checked)}
              />
              <span className="fl-interrupteur__piste" aria-hidden="true" />
            </label>
            <Champ
              label="Droits d’utilisation"
              erreur={erreurs.droits}
              aide="Source, licence ou ayant droit. Vide : « Document publié par vous sur ScolaRead »."
            >
              {(props) => (
                <textarea
                  {...props}
                  className="fl-input fl-input--zone"
                  rows={3}
                  maxLength={2000}
                  value={valeurs.droits}
                  onChange={modifier('droits')}
                />
              )}
            </Champ>
          </section>

          <button type="submit" className="tdb-bouton tdb-bouton--plein fl__soumettre" disabled={envoi}>
            {envoi ? 'Enregistrement…' : edition ? 'Enregistrer les modifications' : 'Publier le livre'}
          </button>
          {edition && (
            <Link to={cheminLivre(livre.id)} className="fl__voir">
              <EyeIcon weight="bold" aria-hidden="true" /> Voir la fiche publique
            </Link>
          )}
        </aside>
      </div>
    </form>
  );
}

export function FormulaireLivrePage() {
  const { id } = useParams();
  const livre = useApi((signal) => (id ? fetchLivre(id, signal) : Promise.resolve(null)), [id ?? '']);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  if (livre.isLoading) return <Loader />;
  if (livre.error)
    return <ErrorMessage error={livre.error} message={livre.error.message} onRetry={livre.reload} />;
  if (livre.data && !livre.data.estProprietaire) {
    return (
      <ErrorMessage message="Ce livre appartient à un autre formateur : vous ne pouvez pas le modifier." />
    );
  }
  // key : le formulaire repart de zéro quand on passe d'un livre à l'autre.
  return <Formulaire key={id ?? 'nouveau'} livre={livre.data} />;
}
