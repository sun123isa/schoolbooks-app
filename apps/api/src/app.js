// =============================================================================
// Socle backend — application Express
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Périmètre : middlewares globaux et montage des modules. Chaque module (dossier
// src/modules/<domaine>) expose un routeur ; un développeur n'ajoute ici qu'une
// ligne app.use(...) pour son module, ce qui limite les conflits de merge.
// =============================================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import booksRoutes, { uploadsRouter } from './modules/books/books.routes.js';
import referentielsRoutes from './modules/referentiels/referentiels.routes.js';
import rechercheRoutes from './modules/recherche/recherche.routes.js';
import ressourcesRoutes from './modules/ressources/ressources.routes.js';

const app = express();

// Middleware de sécurité : ajoute des en-têtes HTTP protecteurs. Si le frontend
// appelle l'API depuis un autre domaine (COOKIE_SAMESITE=none), les PDF doivent
// pouvoir être lus par cette autre origine (Cross-Origin-Resource-Policy).
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: env.cookieSameSite === 'none' ? 'cross-origin' : 'same-origin' }
  })
);

// Middleware CORS : seul le frontend (CLIENT_URL, plusieurs origines séparées
// par des virgules) peut appeler l'API depuis un navigateur. En développement,
// le proxy Vite rend les appels same-origin : CORS n'intervient pas.
// credentials : les cookies de session (HTTP-only) accompagnent les requêtes.
app.use(
  cors({ origin: env.clientUrls, credentials: true, methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE'] })
);

// Derrière un proxy (production), req.ip doit être l'IP du client (limitation de débit).
app.set('trust proxy', 1);

// Middleware pour parser le JSON des requêtes (corps limité).
app.use(express.json({ limit: '100kb' }));

// Logger HTTP : affiche les requêtes dans le terminal en développement.
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes publiques de test.
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Schoolbooks API fonctionne'
  });
});

// Référentiels — Isaac LELO MAKAYA : /api/niveaux, /api/matieres, /api/annees, /api/types-documents
app.use('/api', referentielsRoutes);

// Recherche — Salem KONGOLO : GET /api/ressources (doit rester AVANT le module ressources)
app.use('/api/ressources', rechercheRoutes);

// Ressources et fichiers — Emmanuel AYA : GET /api/ressources/:id[/fichier|/telechargement]
app.use('/api/ressources', ressourcesRoutes);

// Comptes : inscription, connexion, refresh token, session, déconnexion.
app.use('/api/auth', authRoutes);

// Livres des formateurs : catalogue, fiche, téléchargement, espace formateur.
app.use('/api/books', booksRoutes);

// Lecture des PDF envoyés par les formateurs (contrôlée, jamais statique).
app.use('/api/uploads/books', uploadsRouter);

// Route inconnue : 404 au format d'erreur commun.
app.use('/api', notFoundMiddleware);

// Middleware de gestion des erreurs (doit être après les routes).
app.use(errorMiddleware);

export default app;
