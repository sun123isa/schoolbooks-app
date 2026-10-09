// =============================================================================
// Module BOOKS — service (règles métier)
//   - catalogue public : livres actifs uniquement ; un livre désactivé n'est
//     visible que par le formateur qui l'a publié ;
//   - un formateur ne gère (modifie, désactive, restaure, supprime) que SES livres ;
//   - BR02 (filière du niveau), BR04 (année si le type l'exige), BR08
//     (téléchargement autorisé), BR09 (pas de doublon de fichier) ;
//   - le chemin disque n'est jamais renvoyé au client.
// =============================================================================
import { API_PREFIX, API_ROUTES, ERROR_CODES, ROLES } from '@schoolbooks/shared';
import { HttpError } from '../../utils/http-error.js';
import { fichierLisible, resoudreChemin } from '../ressources/storage.js';
import * as repository from './books.repository.js';
import { empreinteFichier, enregistrerPdf, estUnPdf, supprimerPdf } from './books.storage.js';

const TYPE_PAR_DEFAUT = 'livre';
const MESSAGE_AUCUN_LIVRE = 'Aucun livre ne correspond à vos critères.';

const reference = (code, libelle) => (code ? { code, libelle } : null);
const videVersNull = (valeur) => (valeur === '' ? null : valeur);

const livreIntrouvable = () =>
  new HttpError(404, ERROR_CODES.LIVRE_INTROUVABLE, "Ce livre n'existe pas ou n'est plus disponible.");

function estProprietaire(ligne, utilisateur) {
  return Boolean(utilisateur) && utilisateur.role === ROLES.formateur && ligne.trainer_id === utilisateur.id;
}

// Nom proposé au navigateur : dérivé du titre, sans caractère problématique.
function nomDeTelechargement(titre) {
  const base = titre
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `${base || 'livre'}.pdf`;
}

// Les livres des formateurs sont toujours des PDF envoyés (uploads/books).
function urlFichier(ligne) {
  return `${API_PREFIX}${API_ROUTES.fichierLivre(ligne.file_name)}`;
}

// Ligne SQL → résumé (listes).
function versResume(ligne) {
  return {
    id: ligne.id,
    titre: ligne.title,
    auteur: ligne.author ?? null,
    description: ligne.description ?? null,
    niveau: reference(ligne.level_code, ligne.level_label),
    filiere: reference(ligne.track_code, ligne.track_label),
    matiere: reference(ligne.subject_code, ligne.subject_label),
    type: reference(ligne.type_code, ligne.type_label),
    annee: ligne.year ?? null,
    telechargeable: ligne.is_downloadable,
    telechargements: ligne.download_count,
    actif: ligne.is_active,
    formateur: ligne.trainer_id
      ? { id: ligne.trainer_id, nom: `${ligne.trainer_first_name} ${ligne.trainer_last_name}` }
      : null,
    dateAjout: new Date(ligne.created_at).toISOString(),
    dateModification: new Date(ligne.updated_at).toISOString(),
    dateDesactivation: ligne.deactivated_at ? new Date(ligne.deactivated_at).toISOString() : null
  };
}

// Ligne SQL → détail (fiche) : disponibilité du fichier et URL de lecture / téléchargement.
async function versDetail(ligne, utilisateur) {
  const disponible = await fichierLisible(ligne.file_path);
  return {
    ...versResume(ligne),
    droits: ligne.usage_rights ?? null,
    tailleOctets: ligne.file_size === null ? null : Number(ligne.file_size),
    disponible,
    estProprietaire: estProprietaire(ligne, utilisateur),
    urls: {
      fichier: disponible ? urlFichier(ligne) : null,
      telechargement:
        disponible && ligne.is_downloadable ? `${API_PREFIX}${API_ROUTES.telechargementLivre(ligne.id)}` : null
    }
  };
}

// --- Consultation publique ------------------------------------------------------

export async function listerLivres(query) {
  const { lignes, total } = await repository.listerLivresPublies(query);
  return {
    items: lignes.map(versResume),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
    message: total === 0 ? MESSAGE_AUCUN_LIVRE : null
  };
}

// Livre visible par l'utilisateur : publié par un formateur, actif ou désactivé
// mais lui appartenant. Les ressources du catalogue passent par /api/ressources.
async function trouverLivreVisible(id, utilisateur) {
  const ligne = await repository.findLivre(id);
  if (!ligne || !ligne.trainer_id || (!ligne.is_active && !estProprietaire(ligne, utilisateur))) {
    throw livreIntrouvable();
  }
  return ligne;
}

export async function obtenirLivre(id, utilisateur) {
  return versDetail(await trouverLivreVisible(id, utilisateur), utilisateur);
}

async function fichierDe(ligne) {
  if (!(await fichierLisible(ligne.file_path))) {
    throw new HttpError(404, ERROR_CODES.FICHIER_INDISPONIBLE, 'Le PDF de ce livre est inaccessible.');
  }
  return { cheminAbsolu: resoudreChemin(ligne.file_path), nomFichier: nomDeTelechargement(ligne.title) };
}

// GET /api/uploads/books/:fileName — lecture dans le navigateur.
export async function obtenirFichierUpload(nomFichier, utilisateur) {
  const ligne = await repository.findLivreParFichier(`uploads/books/${nomFichier}`);
  if (!ligne || (!ligne.is_active && !estProprietaire(ligne, utilisateur))) throw livreIntrouvable();
  return fichierDe(ligne);
}

// GET /api/books/:id/download — BR08 : 403 si le téléchargement n'est pas autorisé.
export async function obtenirFichierTelechargeable(id, utilisateur) {
  const ligne = await trouverLivreVisible(id, utilisateur);
  if (!ligne.is_downloadable) {
    throw new HttpError(
      403,
      ERROR_CODES.TELECHARGEMENT_NON_AUTORISE,
      "Ce livre est consultable en ligne mais n'est pas téléchargeable."
    );
  }
  return fichierDe(ligne);
}

export async function enregistrerTelechargement(id) {
  await repository.incrementerTelechargements(id);
}

// --- Espace formateur -------------------------------------------------------------

export async function mesLivres(formateur) {
  const [lignes, stats] = await Promise.all([
    repository.listerLivresFormateur(formateur.id),
    repository.statistiquesFormateur(formateur.id)
  ]);
  return { items: lignes.map(versResume), statistiques: stats };
}

// Livre du formateur, quel que soit son état. 404 si inconnu, 403 si d'un autre formateur.
async function trouverMonLivre(id, formateur) {
  const ligne = await repository.findLivre(id);
  if (!ligne) throw livreIntrouvable();
  if (!estProprietaire(ligne, formateur)) {
    throw new HttpError(403, ERROR_CODES.ACCES_INTERDIT, "Ce livre appartient à un autre formateur.");
  }
  return ligne;
}

// Codes → identifiants, avec BR02 (filière du niveau) et BR04 (année requise).
async function resoudre({ niveau, matiere, type, filiere, annee }) {
  const ref = await repository.resoudreReferentiels({ niveau, matiere, type, filiere });
  if (!ref) {
    throw new HttpError(400, ERROR_CODES.REFERENTIEL_INCONNU, 'Niveau, matière ou type de document inconnu.');
  }
  if (filiere && !ref.track_id) {
    throw new HttpError(
      400,
      ERROR_CODES.FILIERE_INCOMPATIBLE,
      `La série/filière « ${filiere} » n'appartient pas au niveau « ${niveau} ».`
    );
  }
  if (ref.requires_year && !annee) {
    throw new HttpError(422, ERROR_CODES.RESSOURCE_INCOMPLETE, `L'année est obligatoire pour le type « ${ref.type_label} ».`);
  }
  return {
    levelId: ref.level_id,
    levelLabel: ref.level_label,
    subjectId: ref.subject_id,
    subjectLabel: ref.subject_label,
    typeId: ref.type_id,
    typeLabel: ref.type_label,
    trackId: ref.track_id ?? null
  };
}

// BR09 — même titre, niveau, matière, type et année qu'un livre existant.
async function verifierDoublonMetadonnees(livre, saufId = null) {
  const doublon = await repository.findDoublonMetadonnees(livre, saufId);
  if (doublon) {
    throw new HttpError(409, ERROR_CODES.DOUBLON, `Un livre identique existe déjà (« ${doublon.title} »).`);
  }
}

// Contrôle du PDF reçu : signature, puis doublon (BR09).
async function verifierPdf(fichier, saufId = null) {
  if (!estUnPdf(fichier.buffer)) {
    throw new HttpError(400, ERROR_CODES.FICHIER_INVALIDE, "Le fichier envoyé n'est pas un PDF valide.");
  }
  const empreinte = empreinteFichier(fichier.buffer);
  const doublon = await repository.findParEmpreinte(empreinte, saufId);
  if (doublon) {
    throw new HttpError(409, ERROR_CODES.DOUBLON, `Ce PDF figure déjà au catalogue (« ${doublon.title} »).`);
  }
  return empreinte;
}

export async function creerLivre(donnees, fichier, formateur) {
  if (!fichier) throw new HttpError(400, ERROR_CODES.FICHIER_REQUIS, 'Le fichier PDF du livre est obligatoire.');

  const type = donnees.type ?? TYPE_PAR_DEFAUT;
  const referentiels = await resoudre({ ...donnees, type });
  await verifierDoublonMetadonnees({ ...referentiels, titre: donnees.titre, annee: donnees.annee });
  const empreinte = await verifierPdf(fichier);
  const stockage = await enregistrerPdf(fichier.buffer);

  let id;
  try {
    id = await repository.creerLivre({
      ...referentiels,
      ...stockage,
      empreinte,
      titre: donnees.titre,
      auteur: donnees.auteur ?? null,
      description: donnees.description ?? null,
      annee: donnees.annee ?? null,
      telechargeable: donnees.telechargeable,
      // BR10 : droits toujours renseignés.
      droits: donnees.droits ?? `Document publié par ${formateur.prenom} ${formateur.nom} (formateur) sur ScolaRead.`,
      trainerId: formateur.id
    });
  } catch (error) {
    // Pas de fichier orphelin si l'insertion échoue.
    await supprimerPdf(stockage.cheminFichier);
    if (error.code === '23505') {
      throw new HttpError(409, ERROR_CODES.DOUBLON, 'Ce PDF figure déjà au catalogue.');
    }
    throw error;
  }
  return obtenirLivre(id, formateur);
}

export async function modifierLivre(id, donnees, fichier, formateur) {
  const ligne = await trouverMonLivre(id, formateur);
  const modifications = {};

  // Référentiels et année : on revalide la combinaison finale.
  const final = {
    niveau: donnees.niveau ?? ligne.level_code,
    matiere: donnees.matiere ?? ligne.subject_code,
    type: donnees.type ?? ligne.type_code,
    filiere: donnees.filiere !== undefined ? videVersNull(donnees.filiere) : ligne.track_code,
    annee: donnees.annee !== undefined ? videVersNull(donnees.annee) : ligne.year
  };
  Object.assign(modifications, await resoudre(final));
  modifications.annee = final.annee;
  await verifierDoublonMetadonnees(
    { ...modifications, titre: donnees.titre ?? ligne.title, annee: final.annee },
    id
  );

  if (donnees.titre !== undefined) modifications.titre = donnees.titre;
  for (const cle of ['auteur', 'description', 'droits']) {
    if (donnees[cle] !== undefined) modifications[cle] = videVersNull(donnees[cle]);
  }
  if (donnees.telechargeable !== undefined) modifications.telechargeable = donnees.telechargeable;

  // Nouveau PDF : écrit d'abord, l'ancien n'est supprimé qu'après la mise à jour.
  let nouveauFichier = null;
  if (fichier) {
    const empreinte = await verifierPdf(fichier, id);
    nouveauFichier = await enregistrerPdf(fichier.buffer);
    Object.assign(modifications, nouveauFichier, { empreinte });
  }

  try {
    await repository.modifierLivre(id, modifications);
  } catch (error) {
    if (nouveauFichier) await supprimerPdf(nouveauFichier.cheminFichier);
    throw error;
  }
  if (nouveauFichier) await supprimerPdf(ligne.file_path);

  return obtenirLivre(id, formateur);
}

// Désactivation : le livre sort du catalogue public mais reste restaurable.
export async function desactiverLivre(id, formateur) {
  await trouverMonLivre(id, formateur);
  await repository.changerActivation(id, false);
  return obtenirLivre(id, formateur);
}

export async function restaurerLivre(id, formateur) {
  await trouverMonLivre(id, formateur);
  await repository.changerActivation(id, true);
  return obtenirLivre(id, formateur);
}

// Suppression définitive : la ligne et le PDF disparaissent.
export async function supprimerDefinitivement(id, formateur) {
  const ligne = await trouverMonLivre(id, formateur);
  await repository.supprimerLivre(id);
  await supprimerPdf(ligne.file_path);
  return { id, message: 'Le livre a été supprimé définitivement.' };
}
