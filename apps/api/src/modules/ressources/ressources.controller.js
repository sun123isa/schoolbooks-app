// =============================================================================
// Module RESSOURCES — contrôleurs
// Responsable : Emmanuel AYA — relecture : Salem KONGOLO
// Détail : { success: true, data: RessourceDetail } (packages/shared/src/contract/ressources.schema.js)
// Fichiers : flux PDF binaire ; en cas d'erreur, JSON au format d'erreur commun.
// =============================================================================
import * as service from './ressources.service.js';

// En-têtes communs aux deux routes de fichier : pas de mise en cache partagée,
// pas d'interprétation du contenu par le navigateur (BR10, protection des documents).
const ENTETES_FICHIER = {
  'Content-Type': 'application/pdf',
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff'
};

export async function obtenirRessource(req, res) {
  res.json({ success: true, data: await service.obtenirRessource(req.valid.params.id) });
}

export async function consulterFichier(req, res, next) {
  const fichier = await service.obtenirFichierConsultable(req.valid.params.id);
  res.set({
    ...ENTETES_FICHIER,
    'Content-Disposition': `inline; filename="${fichier.nomFichier}"`
  });
  res.sendFile(fichier.cheminAbsolu, (err) => {
    if (err && !res.headersSent) next(err);
  });
}

export async function telechargerFichier(req, res, next) {
  const { id } = req.valid.params;
  const fichier = await service.obtenirFichierTelechargeable(id);
  res.set(ENTETES_FICHIER);
  res.download(fichier.cheminAbsolu, fichier.nomFichier, (err) => {
    if (err) {
      if (!res.headersSent) next(err);
      return;
    }
    // Compteur incrémenté uniquement après un envoi complet ; un échec du
    // compteur ne doit pas transformer un téléchargement réussi en erreur.
    service.enregistrerTelechargement(id).catch((error) => {
      console.error('Compteur de téléchargements non mis à jour :', error.message);
    });
  });
}
