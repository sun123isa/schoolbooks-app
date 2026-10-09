// =============================================================================
// Socle frontend — déclaration des routes
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Trois gabarits :
//   - site public (en-tête, pied de page) : accueil, recherche, ressources, livres ;
//   - pages de connexion / inscription, plein écran ;
//   - espace formateur (barre latérale, tableau de bord), protégé par FormateurLayout.
// La landing est chargée tout de suite ; les autres pages à la première visite.
// =============================================================================
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../shared/layout/Layout.jsx';
import { RouteErrorPage } from '../shared/components/RouteErrorPage.jsx';
import { NotFoundPage } from '../shared/components/NotFoundPage.jsx';
import { LandingPage } from '../pages/landing/LandingPage.jsx';
import { CelebrationRacine } from '../shared/celebration/Celebration.jsx';
import { ROUTES } from './routes.js';

const page = (charger) => ({ lazy: async () => ({ Component: await charger() }) });

export const router = createBrowserRouter([
  {
    // Racine : fournit les célébrations (publication, création de compte) à tous les gabarits.
    element: <CelebrationRacine />,
    children: [
      {
        element: <Layout />,
        // Gestion globale des erreurs de rendu : une page qui plante n'emporte pas l'application.
        errorElement: <RouteErrorPage />,
        children: [
          { path: ROUTES.accueil, element: <LandingPage />, handle: { pleineLargeur: true } }, // Jean Baptiste
          {
            path: ROUTES.recherche,
            ...page(async () => (await import('../pages/recherche/RecherchePage.jsx')).RecherchePage)
          }, // Graciel
          {
            path: ROUTES.ressource,
            ...page(async () => (await import('../pages/ressource/RessourcePage.jsx')).RessourcePage)
          }, // Karene
          {
            path: ROUTES.livres,
            ...page(async () => (await import('../pages/livres/LivresPage.jsx')).LivresPage)
          },
          {
            path: ROUTES.livre,
            ...page(async () => (await import('../pages/livres/LivrePage.jsx')).LivrePage)
          },
          { path: '*', element: <NotFoundPage /> }
        ]
      },

      // Comptes : pages plein écran (visuel à gauche, formulaire à droite).
      {
        errorElement: <RouteErrorPage />,
        children: [
          {
            path: ROUTES.connexion,
            ...page(async () => (await import('../pages/auth/ConnexionPage.jsx')).ConnexionPage)
          },
          {
            path: ROUTES.inscription,
            ...page(async () => (await import('../pages/auth/InscriptionPage.jsx')).InscriptionPage)
          }
        ]
      },

      // Espace formateur : réservé aux formateurs (contrôle dans FormateurLayout).
      {
        path: ROUTES.tableauDeBord,
        errorElement: <RouteErrorPage />,
        ...page(async () => (await import('../pages/formateur/FormateurLayout.jsx')).FormateurLayout),
        children: [
          {
            index: true,
            ...page(async () => (await import('../pages/formateur/TableauDeBordPage.jsx')).TableauDeBordPage)
          },
          {
            path: ROUTES.mesLivres,
            ...page(async () => (await import('../pages/formateur/GestionLivresPage.jsx')).GestionLivresPage)
          },
          {
            path: ROUTES.nouveauLivre,
            ...page(
              async () => (await import('../pages/formateur/FormulaireLivrePage.jsx')).FormulaireLivrePage
            )
          },
          {
            path: ROUTES.modifierLivre,
            ...page(
              async () => (await import('../pages/formateur/FormulaireLivrePage.jsx')).FormulaireLivrePage
            )
          }
        ]
      }
    ]
  }
]);
