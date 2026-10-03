// =============================================================================
// Socle frontend — déclaration des routes
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Une ligne par page : chaque développeur ne modifie que son dossier src/pages/<page>/.
// =============================================================================
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../shared/layout/Layout.jsx';
import { RouteErrorPage } from '../shared/components/RouteErrorPage.jsx';
import { NotFoundPage } from '../shared/components/NotFoundPage.jsx';
import { LandingPage } from '../pages/landing/LandingPage.jsx';
import { RecherchePage } from '../pages/recherche/RecherchePage.jsx';
import { RessourcePage } from '../pages/ressource/RessourcePage.jsx';
import { ROUTES } from './routes.js';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    // Gestion globale des erreurs de rendu : une page qui plante n'emporte pas l'application.
    errorElement: <RouteErrorPage />,
    children: [
      { path: ROUTES.accueil, element: <LandingPage />, handle: { pleineLargeur: true } }, // Jean Baptiste
      { path: ROUTES.recherche, element: <RecherchePage /> }, // Graciel
      { path: ROUTES.ressource, element: <RessourcePage /> }, // Karene
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);
