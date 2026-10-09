// =============================================================================
// Données fictives — référentiels des formulaires et catalogue des livres
// Utilisées uniquement en mode maquette (VITE_USE_MOCKS=true, sans backend).
// Le catalogue fictif est vide : les livres n'existent qu'une fois publiés par
// un formateur ; la connexion et l'inscription exigent l'API réelle.
// =============================================================================
import { LIMITE_LIVRES_PAR_DEFAUT } from '../contract/livres.schema.js';
import { MATIERES, NIVEAUX, listerFilieresMock } from './referentiels.mock.js';

// GET /api/school-levels
export const NIVEAUX_SCOLAIRES = NIVEAUX.map((niveau, index) => ({
  id: index + 1,
  ...niveau,
  filieres: listerFilieresMock(niveau.code).map((filiere, i) => ({
    id: i + 1,
    code: filiere.code,
    libelle: filiere.libelle
  }))
}));

// GET /api/subjects
export const MATIERES_AVEC_ID = MATIERES.map((matiere, index) => ({ id: index + 1, ...matiere }));

// GET /api/books — catalogue vide, au format de ListeLivresSchema.
export function listerLivresMock({ page = 1, limit = LIMITE_LIVRES_PAR_DEFAUT } = {}) {
  return {
    items: [],
    total: 0,
    page,
    limit,
    totalPages: 1,
    message: 'Aucun livre ne correspond à vos critères.'
  };
}
