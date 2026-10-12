// =============================================================================
// Tests — base de données fictive (aucun PostgreSQL requis)
// Responsable : Salem KONGOLO (Lead Reviewer) — relecture : Isaac LELO MAKAYA
// Chaque repository (couche SQL) est remplacé par une version en mémoire qui
// s'appuie sur @schoolbooks/shared/mocks. Les services, contrôleurs, routes et
// le stockage des fichiers testés sont donc les vrais.
// Ressources fictives : fichier « ressources/exemple.pdf » (présent dans
// test/fixtures/storage) si disponible, sinon un fichier absent (BR06).
// =============================================================================
import { vi } from 'vitest';

vi.mock('../../src/modules/referentiels/referentiels.repository.js', async () => {
  const mocks = await import('@schoolbooks/shared/mocks');
  return {
    findNiveaux: async () => mocks.NIVEAUX,
    findFilieresByNiveau: async (code) => mocks.listerFilieresMock(code),
    findMatieres: async () => mocks.MATIERES,
    findAnnees: async () => mocks.listerAnneesMock(),
    findTypesDocuments: async () => mocks.TYPES_DOCUMENTS,
    findNiveauxScolaires: async () =>
      mocks.NIVEAUX.map((n, index) => ({
        id: index + 1,
        ...n,
        filieres: mocks.listerFilieresMock(n.code).map((f, i) => ({ id: i + 1, code: f.code, libelle: f.libelle }))
      })),
    findMatieresAvecId: async () => mocks.MATIERES.map((m, index) => ({ id: index + 1, ...m }))
  };
});

vi.mock('../../src/modules/recherche/recherche.repository.js', async () => {
  const { rechercherRessourcesMock } = await import('@schoolbooks/shared/mocks');
  return {
    rechercherRessources: async (query) => {
      const { items, total } = rechercherRessourcesMock(query);
      return { rows: items, total };
    }
  };
});

vi.mock('../../src/modules/ressources/ressources.repository.js', async () => {
  const { trouverRessourceMock } = await import('@schoolbooks/shared/mocks');

  // Détail fictif (format du contrat) → ligne SQL (format du repository réel).
  const versLigne = (r) => ({
    id: r.id,
    title: r.titre,
    author: r.auteur,
    description: r.description,
    year: r.annee,
    is_downloadable: r.telechargeable,
    usage_rights: r.droits,
    // pg renvoie les BIGINT en chaîne : même comportement ici.
    file_size: r.tailleOctets === null ? null : String(r.tailleOctets),
    file_path: r.disponible ? 'ressources/exemple.pdf' : 'ressources/manquant.pdf',
    created_at: new Date(r.dateAjout),
    level_code: r.niveau.code,
    level_label: r.niveau.libelle,
    track_code: r.filiere?.code ?? null,
    track_label: r.filiere?.libelle ?? null,
    subject_code: r.matiere.code,
    subject_label: r.matiere.libelle,
    type_code: r.type.code,
    type_label: r.type.libelle
  });

  return {
    findRessourceById: async (id) => {
      const ressource = trouverRessourceMock(id);
      return ressource ? versLigne(ressource) : null;
    },
    incrementerTelechargements: vi.fn(async () => {}),
    findDoublon: vi.fn(async () => null),
    insererRessource: vi.fn(async () => ({ id: '00000000-0000-4000-8000-000000000000' }))
  };
});

// Comptes et sessions en mémoire (module auth).
vi.mock('../../src/modules/auth/auth.repository.js', () => {
  const comptes = [];
  const jetons = new Map();
  const vue = (c) => c && { ...c };
  return {
    emailExiste: async (email) => comptes.some((c) => c.email.toLowerCase() === email.toLowerCase()),
    findCompteParEmail: async (email) => vue(comptes.find((c) => c.email.toLowerCase() === email.toLowerCase())),
    findCompte: async (role, id) => vue(comptes.find((c) => c.role === role && c.id === id)),
    creerApprenant: async (d) => {
      const c = { id: crypto.randomUUID(), role: 'learner', first_name: d.prenom, last_name: d.nom, email: d.email, level: d.niveau, specialty: null, password_hash: d.motDePasseHache, status: 'active' };
      comptes.push(c);
      return vue(c);
    },
    creerFormateur: async (d) => {
      const c = { id: crypto.randomUUID(), role: 'trainer', first_name: d.prenom, last_name: d.nom, email: d.email, level: null, specialty: d.specialite, password_hash: d.motDePasseHache, status: 'active' };
      comptes.push(c);
      return vue(c);
    },
    enregistrerConnexion: async () => {},
    niveauExiste: async (code) => ['lycee', 'universite'].includes(code),
    creerRefreshToken: async ({ userId, role, tokenHash, expireLe }) => {
      jetons.set(tokenHash, { user_id: userId, user_role: role, expireLe, revoque: false });
    },
    findRefreshTokenValide: async (hash) => {
      const j = jetons.get(hash);
      return j && !j.revoque && j.expireLe > new Date() ? { id: hash, user_id: j.user_id, user_role: j.user_role } : null;
    },
    revoquerRefreshToken: async (hash) => {
      const j = jetons.get(hash);
      if (!j || j.revoque) return false;
      j.revoque = true;
      return true;
    },
    purgerRefreshTokensExpires: async () => {}
  };
});
