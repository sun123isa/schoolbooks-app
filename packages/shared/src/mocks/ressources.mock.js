// =============================================================================
// Données fictives — ressources et recherche
// Responsables : Emmanuel AYA (données ressources), Salem KONGOLO (rechercherRessourcesMock)
// Sert au frontend en mode mock (VITE_USE_MOCKS=true) et aux squelettes backend
// tant que les requêtes SQL ne sont pas écrites. Conforme aux schémas du contrat.
// =============================================================================
import { API_PREFIX, API_ROUTES } from '../contract/api-routes.js';
import { MESSAGE_AUCUN_RESULTAT } from '../contract/recherche.schema.js';
import { FILIERES, MATIERES, NIVEAUX, TYPES_DOCUMENTS } from './referentiels.mock.js';

const ref = (liste, code) => {
  const element = liste.find((item) => item.code === code);
  return element ? { code: element.code, libelle: element.libelle } : null;
};

function ressource({ id, titre, niveau, filiere = null, matiere, type, annee = null, telechargeable, disponible = true, description = null, auteur = null, tailleOctets = null, droits = null, dateAjout }) {
  const peutTelecharger = telechargeable && disponible;
  return {
    id,
    titre,
    niveau: ref(NIVEAUX, niveau),
    filiere: filiere ? ref(FILIERES, filiere) : null,
    matiere: ref(MATIERES, matiere),
    type: ref(TYPES_DOCUMENTS, type),
    annee,
    format: 'PDF',
    telechargeable,
    description,
    auteur,
    tailleOctets,
    disponible,
    droits,
    dateAjout,
    urls: {
      fichier: disponible ? `${API_PREFIX}${API_ROUTES.fichier(id)}` : null,
      telechargement: peutTelecharger ? `${API_PREFIX}${API_ROUTES.telechargement(id)}` : null
    }
  };
}

export const RESSOURCES = [
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000001',
    titre: 'Baccalauréat série C 2023 — Mathématiques (sujet)',
    niveau: 'lycee', filiere: 'serie-c', matiere: 'mathematiques', type: 'sujet-examen', annee: 2023,
    telechargeable: true,
    description: "Sujet officiel de l'épreuve de mathématiques du baccalauréat série C, session 2023.",
    auteur: "Direction des examens et concours", tailleOctets: 412_000,
    droits: 'Document officiel — diffusion libre à usage éducatif.',
    dateAjout: '2026-09-01T08:00:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000002',
    titre: 'Baccalauréat série C 2023 — Mathématiques (corrigé)',
    niveau: 'lycee', filiere: 'serie-c', matiere: 'mathematiques', type: 'corrige', annee: 2023,
    telechargeable: true,
    description: 'Corrigé détaillé, exercice par exercice, du sujet de mathématiques 2023.',
    auteur: 'Équipe pédagogique Schoolbooks', tailleOctets: 655_000,
    droits: 'Rédigé par l’équipe — licence CC BY-NC 4.0.',
    dateAjout: '2026-09-02T08:00:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000003',
    titre: 'Baccalauréat série D 2022 — SVT (sujet)',
    niveau: 'lycee', filiere: 'serie-d', matiere: 'svt', type: 'sujet-examen', annee: 2022,
    telechargeable: true,
    description: 'Sujet de sciences de la vie et de la Terre, baccalauréat série D, session 2022.',
    auteur: 'Direction des examens et concours', tailleOctets: 380_000,
    droits: 'Document officiel — diffusion libre à usage éducatif.',
    dateAjout: '2026-09-03T08:00:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000004',
    titre: 'Baccalauréat série A 2024 — Philosophie (sujet)',
    niveau: 'lycee', filiere: 'serie-a', matiere: 'philosophie', type: 'sujet-examen', annee: 2024,
    telechargeable: false,
    description: 'Sujets de dissertation et commentaire de texte, session 2024. Consultation en ligne uniquement.',
    auteur: 'Direction des examens et concours', tailleOctets: 210_000,
    droits: "Consultation seule — reproduction soumise à l'accord de l'ayant droit.",
    dateAjout: '2026-09-04T08:00:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000005',
    titre: 'Physique-Chimie Terminale C — Manuel',
    niveau: 'lycee', filiere: 'serie-c', matiere: 'physique-chimie', type: 'livre',
    telechargeable: false,
    description: 'Manuel de référence couvrant le programme de Terminale C.',
    auteur: 'Moussa Traoré', tailleOctets: 7_340_032,
    droits: "Ouvrage sous droits — consultation en ligne autorisée par l'éditeur.",
    dateAjout: '2026-09-05T08:00:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000006',
    titre: 'Méthodologie de la dissertation — Français',
    niveau: 'lycee', matiere: 'francais', type: 'cours',
    telechargeable: true,
    description: 'Support de cours sur la méthode de la dissertation, valable pour toutes les séries.',
    auteur: 'Koffi Yao', tailleOctets: 980_000,
    droits: 'Licence CC BY 4.0.',
    dateAjout: '2026-09-06T08:00:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000007',
    titre: 'Algorithmique — Licence 1 Informatique (cours)',
    niveau: 'universite', filiere: 'licence-informatique', matiere: 'informatique', type: 'cours',
    telechargeable: true,
    description: "Cours d'introduction à l'algorithmique : variables, structures de contrôle, tableaux, complexité.",
    auteur: 'Fatou Koné', tailleOctets: 2_400_000,
    droits: 'Licence CC BY-SA 4.0.',
    dateAjout: '2026-09-07T08:00:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000008',
    titre: 'Examen final 2023 — Algorithmique L1 (sujet)',
    niveau: 'universite', filiere: 'licence-informatique', matiere: 'informatique', type: 'sujet-examen', annee: 2023,
    telechargeable: true,
    description: "Sujet de l'examen final d'algorithmique, première année de licence, session 2023.",
    auteur: "Faculté des sciences", tailleOctets: 320_000,
    droits: 'Diffusion autorisée par la faculté à usage éducatif.',
    dateAjout: '2026-09-08T08:00:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000009',
    titre: 'Microéconomie — Fiches d’exercices L1',
    niveau: 'universite', filiere: 'licence-economie', matiere: 'economie', type: 'exercices',
    telechargeable: false,
    description: "Exercices d'application sur l'offre, la demande et l'équilibre de marché.",
    auteur: 'Département d’économie', tailleOctets: 540_000,
    droits: 'Consultation seule.',
    dateAjout: '2026-09-09T08:00:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000010',
    titre: 'Baccalauréat série D 2021 — Anglais (sujet)',
    niveau: 'lycee', filiere: 'serie-d', matiere: 'anglais', type: 'sujet-examen', annee: 2021,
    telechargeable: true,
    description: "Sujet d'anglais du baccalauréat série D, session 2021.",
    auteur: 'Direction des examens et concours', tailleOctets: 260_000,
    droits: 'Document officiel — diffusion libre à usage éducatif.',
    dateAjout: '2026-09-10T08:00:00.000Z'
  }),
  // Ressource dont le fichier est manquant : sert à tester le cas « PDF inaccessible » (BR06).
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000011',
    titre: 'Baccalauréat série A 2020 — Histoire-Géographie (sujet)',
    niveau: 'lycee', filiere: 'serie-a', matiere: 'histoire-geographie', type: 'sujet-examen', annee: 2020,
    telechargeable: true, disponible: false,
    description: "Sujet d'histoire-géographie, session 2020. Fichier temporairement indisponible.",
    auteur: 'Direction des examens et concours', tailleOctets: null,
    droits: 'Document officiel — diffusion libre à usage éducatif.',
    dateAjout: '2026-09-11T08:00:00.000Z'
  }),
  // Vrais sujets du baccalauréat congolais (PDF dans apps/web/public/mocks/).
  // Téléchargement désactivé (BR10, interdit par défaut) tant que l'autorisation
  // de diffusion de l'auteur n'est pas confirmée.
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000012',
    titre: 'Baccalauréat série A 2016 — Mathématiques (sujet)',
    niveau: 'lycee', filiere: 'serie-a', matiere: 'mathematiques', type: 'sujet-examen', annee: 2016,
    telechargeable: false,
    description: 'Sujet de mathématiques du baccalauréat série A, session 2016 (République du Congo).',
    auteur: 'Valérien Eberlin (maths.congo.free.fr)', tailleOctets: 54_142,
    droits: 'Publié par Valérien Eberlin sur maths.congo.free.fr — autorisation de diffusion à confirmer.',
    dateAjout: '2026-10-05T08:00:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000013',
    titre: 'Baccalauréat série C 2017 — Physique-Chimie (sujet)',
    niveau: 'lycee', filiere: 'serie-c', matiere: 'physique-chimie', type: 'sujet-examen', annee: 2017,
    telechargeable: false,
    description: 'Sujet de physique-chimie du baccalauréat série C, session 2017 (République du Congo) : chimie et physique.',
    auteur: 'Valérien Eberlin (maths.congo.free.fr)', tailleOctets: 78_399,
    droits: 'Publié par Valérien Eberlin sur maths.congo.free.fr — autorisation de diffusion à confirmer.',
    dateAjout: '2026-10-05T08:01:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000014',
    titre: 'Baccalauréat série A 2020 — Mathématiques (corrigé)',
    niveau: 'lycee', filiere: 'serie-a', matiere: 'mathematiques', type: 'corrige', annee: 2020,
    telechargeable: false,
    description: 'Corrigé détaillé, exercice par exercice, du sujet de mathématiques du baccalauréat série A, session 2020.',
    auteur: 'Valérien Eberlin (maths.congo.free.fr)', tailleOctets: 75_492,
    droits: 'Publié par Valérien Eberlin sur maths.congo.free.fr — autorisation de diffusion à confirmer.',
    dateAjout: '2026-10-05T08:02:00.000Z'
  }),
  ressource({
    id: '0b6f2a4e-1c3d-4e5f-8a9b-000000000015',
    titre: 'Baccalauréat série C 2020 — Mathématiques (sujet)',
    niveau: 'lycee', filiere: 'serie-c', matiere: 'mathematiques', type: 'sujet-examen', annee: 2020,
    telechargeable: false,
    description: 'Sujet de mathématiques du baccalauréat série C, session 2020 (République du Congo).',
    auteur: 'Valérien Eberlin (maths.congo.free.fr)', tailleOctets: 55_626,
    droits: 'Publié par Valérien Eberlin sur maths.congo.free.fr — autorisation de diffusion à confirmer.',
    dateAjout: '2026-10-05T08:03:00.000Z'
  })
];

// Champs du résumé (cartes de résultats).
export function versResume(detail) {
  const { id, titre, niveau, filiere, matiere, type, annee, format, telechargeable } = detail;
  return { id, titre, niveau, filiere, matiere, type, annee, format, telechargeable };
}

// Années distinctes, ordre décroissant (GET /api/annees).
export function listerAnneesMock() {
  return [...new Set(RESSOURCES.map((r) => r.annee).filter((a) => a !== null))].sort((a, b) => b - a);
}

export function trouverRessourceMock(id) {
  return RESSOURCES.find((r) => r.id === id) ?? null;
}

// Recherche insensible à la casse et aux accents (« economie » trouve « Économie »).
const normaliser = (texte) =>
  texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// Recherche fictive : reproduit le comportement attendu de GET /api/ressources.
// `query` est la sortie de RechercheQuerySchema.parse (valeurs déjà validées).
export function rechercherRessourcesMock(query) {
  const { q, niveau, filiere, matiere, annee, type, page, limit, tri } = query;

  // BR07 : chaque filtre fourni est appliqué strictement.
  let resultats = RESSOURCES.filter(
    (r) =>
      (!niveau || r.niveau.code === niveau) &&
      (!filiere || r.filiere?.code === filiere) &&
      (!matiere || r.matiere.code === matiere) &&
      (!annee || r.annee === annee) &&
      (!type || r.type.code === type) &&
      (!q || normaliser(`${r.titre} ${r.description ?? ''}`).includes(normaliser(q)))
  );

  if (tri === 'titre') {
    resultats = [...resultats].sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));
  } else if (tri === 'recent') {
    resultats = [...resultats].sort((a, b) => (b.annee ?? 0) - (a.annee ?? 0));
  }

  const total = resultats.length;
  const debut = (page - 1) * limit;
  const filtres = Object.fromEntries(
    Object.entries({ q, niveau, filiere, matiere, annee, type }).filter(([, v]) => v !== undefined)
  );

  return {
    items: resultats.slice(debut, debut + limit).map(versResume),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    filtres,
    tri,
    message: total === 0 ? MESSAGE_AUCUN_RESULTAT : null
  };
}
