// =============================================================================
// Module RÉFÉRENTIELS — contrôleurs (HTTP uniquement : lecture de req, envoi de res)
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Réponse : { success: true, data } — schémas dans packages/shared/src/contract/referentiels.schema.js
// Express 5 transmet automatiquement les erreurs des fonctions async à errorMiddleware.
// =============================================================================
import * as service from './referentiels.service.js';

export async function listerNiveaux(req, res) {
  res.json({ success: true, data: await service.listerNiveaux() });
}

export async function listerFilieres(req, res) {
  res.json({ success: true, data: await service.listerFilieres(req.valid.params.code) });
}

export async function listerMatieres(req, res) {
  res.json({ success: true, data: await service.listerMatieres() });
}

export async function listerAnnees(req, res) {
  res.json({ success: true, data: await service.listerAnnees() });
}

export async function listerTypesDocuments(req, res) {
  res.json({ success: true, data: await service.listerTypesDocuments() });
}

export async function listerNiveauxScolaires(req, res) {
  res.json({ success: true, data: await service.listerNiveauxScolaires() });
}

export async function listerMatieresAvecId(req, res) {
  res.json({ success: true, data: await service.listerMatieresAvecId() });
}
