// =============================================================================
// Socle frontend — déclaration des routes
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Une ligne par page : chaque développeur ne modifie que son dossier src/pages/<page>/.
// La landing est chargée tout de suite (point d'entrée) ; la recherche et la
// consultation sont découpées par route (chargées à la première visite).
// =============================================================================
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../shared/layout/Layout.jsx';
import { RouteErrorPage } from '../shared/components/RouteErrorPage.jsx';
import { NotFoundPage } from '../shared/components/NotFoundPage.jsx';
import { LandingPage } from '../pages/landing/LandingPage.jsx';
import { ROUTES } from './routes.js';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    // Gestion globale des erreurs de rendu : une page qui plante n'emporte pas l'application.
    errorElement: <RouteErrorPage />,
    children: [
      { path: ROUTES.accueil, element: <LandingPage />, handle: { pleineLargeur: true } }, // Jean Baptiste
      {
        path: ROUTES.recherche, // Graciel
        lazy: async () => ({ Component: (await import('../pages/recherche/RecherchePage.jsx')).RecherchePage })
      },
      {
        path: ROUTES.ressource, // Karene
        lazy: async () => ({ Component: (await import('../pages/ressource/RessourcePage.jsx')).RessourcePage })
      },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);
