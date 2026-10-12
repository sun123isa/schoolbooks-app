// =============================================================================
// Module RECHERCHE — contrôleur
// Responsable : Salem KONGOLO — relecture : HIRWA Jean Baptiste
// Réponse : { success: true, data: RechercheResultat } — voir
// packages/shared/src/contract/recherche.schema.js. Aucun résultat = 200 avec
// items: [], total: 0 et un message explicite (jamais un 404).
// =============================================================================
import * as service from './recherche.service.js';

export async function rechercher(req, res) {
  res.json({ success: true, data: await service.rechercher(req.valid.query) });
}
