// =============================================================================
// Module RECHERCHE — service
// Responsable : Salem KONGOLO — relecture : HIRWA Jean Baptiste
// Construit la réponse { items, total, page, limit, totalPages, filtres, tri,
// message } (RechercheResultatSchema) à partir de recherche.repository.js.
//   - BR02 : filière incompatible avec le niveau → 400 FILIERE_INCOMPATIBLE ;
//   - BR07 : chaque filtre fourni restreint strictement les résultats ;
//   - seules les ressources publiées et complètes sont exposées (BR01/BR03/BR05) ;
//   - aucun résultat : 200 avec un message explicite (jamais un 404).
// =============================================================================
import { MESSAGE_AUCUN_RESULTAT } from '@schoolbooks/shared';
import * as repository from './recherche.repository.js';
import { verifierCompatibiliteFiliere } from '../referentiels/referentiels.service.js';

export async function rechercher(query) {
  // BR02 : une filière incompatible avec le niveau est une erreur explicite (400).
  await verifierCompatibiliteFiliere(query.niveau, query.filiere);

  const { q, niveau, filiere, matiere, annee, type, page, limit, tri } = query;
  const { rows, total } = await repository.rechercherRessources(query);

  // Rappel des critères réellement appliqués (sans page/limit/tri ni valeurs absentes).
  const filtres = Object.fromEntries(
    Object.entries({ q, niveau, filiere, matiere, annee, type }).filter(([, valeur]) => valeur !== undefined)
  );

  return {
    items: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    filtres,
    tri,
    message: total === 0 ? MESSAGE_AUCUN_RESULTAT : null
  };
}
