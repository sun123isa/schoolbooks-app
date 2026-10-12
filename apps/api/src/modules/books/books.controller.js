// =============================================================================
// Module BOOKS — contrôleurs (HTTP uniquement)
// JSON : { success: true, data } ; fichiers : flux PDF binaire.
// =============================================================================
import * as service from './books.service.js';

// Pas de mise en cache partagée, pas d'interprétation du contenu (protection des documents).
const ENTETES_FICHIER = {
  'Content-Type': 'application/pdf',
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff'
};

const repondre = (res, data, status = 200) => res.status(status).json({ success: true, data });

export async function listerLivres(req, res) {
  repondre(res, await service.listerLivres(req.valid.query));
}

export async function obtenirLivre(req, res) {
  repondre(res, await service.obtenirLivre(req.valid.params.id, req.utilisateur));
}

export async function lireFichier(req, res, next) {
  const fichier = await service.obtenirFichierUpload(req.valid.params.fileName, req.utilisateur);
  res.set({ ...ENTETES_FICHIER, 'Content-Disposition': `inline; filename="${fichier.nomFichier}"` });
  res.sendFile(fichier.cheminAbsolu, (err) => {
    if (err && !res.headersSent) next(err);
  });
}

export async function telecharger(req, res, next) {
  const { id } = req.valid.params;
  const fichier = await service.obtenirFichierTelechargeable(id, req.utilisateur);
  res.set(ENTETES_FICHIER);
  res.download(fichier.cheminAbsolu, fichier.nomFichier, (err) => {
    if (err) {
      if (!res.headersSent) next(err);
      return;
    }
    // Compteur incrémenté uniquement après un envoi complet.
    service.enregistrerTelechargement(id).catch((error) => {
      console.error('Compteur de téléchargements non mis à jour :', error.message);
    });
  });
}

export async function mesLivres(req, res) {
  repondre(res, await service.mesLivres(req.utilisateur));
}

export async function creerLivre(req, res) {
  repondre(res, await service.creerLivre(req.valid.body, req.file, req.utilisateur), 201);
}

export async function modifierLivre(req, res) {
  repondre(res, await service.modifierLivre(req.valid.params.id, req.valid.body, req.file, req.utilisateur));
}

export async function desactiverLivre(req, res) {
  repondre(res, await service.desactiverLivre(req.valid.params.id, req.utilisateur));
}

export async function restaurerLivre(req, res) {
  repondre(res, await service.restaurerLivre(req.valid.params.id, req.utilisateur));
}

export async function supprimerDefinitivement(req, res) {
  repondre(res, await service.supprimerDefinitivement(req.valid.params.id, req.utilisateur));
}
