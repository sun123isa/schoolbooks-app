// =============================================================================
// Socle frontend — mise en forme des libellés venant de l'API
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Les titres et libellés du catalogue contiennent des tirets cadratins
// (« Baccalauréat série C 2023 — Mathématiques (sujet) »). L'interface ne les
// affiche pas : ils sont remplacés ici, à l'affichage, sans modifier les
// données (base, seeds et mocks restent inchangés).
// Usage : titreRessource(r.titre), filiereCourte(r.filiere?.libelle)…
// =============================================================================

const TIRET = /\s*[—–]\s*/;
const TIRETS = /\s*[—–]\s*/g;

// « Baccalauréat série C 2023 — Mathématiques (sujet) »
//   → « Baccalauréat série C 2023, Mathématiques (sujet) »
export function titreRessource(titre) {
  return typeof titre === 'string' ? titre.replace(TIRETS, ', ') : titre;
}

// « Série C — Mathématiques et sciences physiques » → « Série C » (cartes, pastilles).
export function filiereCourte(libelle) {
  return typeof libelle === 'string' ? libelle.split(TIRET)[0] : libelle;
}

// « Série C — Mathématiques et sciences physiques »
//   → « Série C (Mathématiques et sciences physiques) » (listes, fiche).
export function filiereComplete(libelle) {
  if (typeof libelle !== 'string') return libelle;
  const [nom, ...precisions] = libelle.split(TIRET);
  return precisions.length ? `${nom} (${precisions.join(', ')})` : nom;
}
