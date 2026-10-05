// =============================================================================
// Socle frontend — page 404 (URL inconnue)
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// =============================================================================
import { ArrowLeftIcon, CompassIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { ROUTES, cheminRecherche } from '../../app/routes.js';
import { EmptyState } from './StatusMessages.jsx';
import { Button } from './ui/Button.jsx';

export function NotFoundPage() {
  return (
    <section aria-labelledby="titre-404" className="page-404">
      <h1 id="titre-404" className="visually-hidden">
        Page introuvable
      </h1>
      <EmptyState
        icon={CompassIcon}
        titre="Page introuvable"
        action={
          <div className="page-404__actions">
            <Button to={ROUTES.accueil} variant="outline" iconLeft={ArrowLeftIcon}>
              Retour à l'accueil
            </Button>
            <Button to={cheminRecherche()} iconLeft={MagnifyingGlassIcon}>
              Rechercher une ressource
            </Button>
          </div>
        }
      >
        Cette page n'existe pas ou a été déplacée.
      </EmptyState>
    </section>
  );
}
