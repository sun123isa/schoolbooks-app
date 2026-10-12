// =============================================================================
// Socle frontend — gestion globale des erreurs de rendu
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Affichée par React Router quand un composant lève une exception.
// =============================================================================
import { Link, useRouteError } from 'react-router-dom';
import { ROUTES } from '../../app/routes.js';

export function RouteErrorPage() {
  const error = useRouteError();
  if (import.meta.env.DEV) console.error(error);

  return (
    <section className="etat etat--erreur" role="alert" style={{ margin: 24 }}>
      <h1>Oups, un problème est survenu</h1>
      <p>
        La page n'a pas pu s'afficher. <Link to={ROUTES.accueil}>Revenir à l'accueil</Link>
      </p>
    </section>
  );
}
