// =============================================================================
// Module AUTH — contrôleurs (HTTP uniquement)
// Réponse : { success: true, data: { utilisateur } } ; les jetons sont posés en
// cookies HTTP-only et ne figurent jamais dans le corps.
// =============================================================================
import * as service from './auth.service.js';
import { COOKIE_REFRESH, effacerCookiesSession, lireCookie, poserCookiesSession } from './cookies.js';

function repondreAvecSession(res, status, { utilisateur, jetons }) {
  poserCookiesSession(res, jetons);
  res.status(status).json({ success: true, data: { utilisateur } });
}

export async function inscrireApprenant(req, res) {
  repondreAvecSession(res, 201, await service.inscrireApprenant(req.valid.body));
}

export async function inscrireFormateur(req, res) {
  repondreAvecSession(res, 201, await service.inscrireFormateur(req.valid.body));
}

export async function connecter(req, res) {
  repondreAvecSession(res, 200, await service.connecter(req.valid.body));
}

export async function rafraichir(req, res) {
  try {
    repondreAvecSession(res, 200, await service.rafraichir(lireCookie(req, COOKIE_REFRESH)));
  } catch (error) {
    // Session invalide : on efface les cookies pour repartir d'un état propre.
    effacerCookiesSession(res);
    throw error;
  }
}

export async function moi(req, res) {
  res.json({ success: true, data: { utilisateur: req.utilisateur } });
}

export async function deconnecter(req, res) {
  await service.deconnecter(lireCookie(req, COOKIE_REFRESH));
  effacerCookiesSession(res);
  res.json({ success: true, data: { message: 'Vous êtes déconnecté.' } });
}
