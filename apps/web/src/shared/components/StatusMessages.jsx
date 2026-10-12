// =============================================================================
// Socle frontend — états communs : chargement, erreur, aucun résultat
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// À réutiliser dans toutes les pages pour une interface homogène.
//   <Loader label="…" />
//   <ErrorMessage error={err} onRetry={reload} />   (message selon err.code)
//   <EmptyState titre="…" action={<Button …/>}>texte</EmptyState>
// =============================================================================
import { ArrowClockwiseIcon, MagnifyingGlassIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { Button } from './ui/Button.jsx';

export function Loader({ label = 'Chargement…' }) {
  return (
    <p className="etat etat--chargement" role="status" aria-live="polite">
      <span className="etat__spinner" aria-hidden="true" />
      {label}
    </p>
  );
}

// Messages lisibles par code d'erreur (ERROR_CODES du contrat). Une page peut
// fournir son propre message via la prop `message`.
const MESSAGES = {
  RESEAU: 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.',
  RESSOURCE_INTROUVABLE: "Cette ressource n'existe pas ou n'est plus disponible.",
  FICHIER_INDISPONIBLE: 'Le document de cette ressource est momentanément inaccessible.',
  TELECHARGEMENT_NON_AUTORISE: 'Cette ressource peut être consultée mais pas téléchargée.',
  VALIDATION_ERROR: 'Certains critères de recherche sont invalides.',
  FILIERE_INCOMPATIBLE: 'La série/filière choisie ne correspond pas au niveau sélectionné.'
};

function messageErreur(error) {
  return MESSAGES[error?.code] ?? 'Une erreur inattendue est survenue.';
}

export function ErrorMessage({ error, message, onRetry, children }) {
  return (
    <div className="etat etat--erreur" role="alert">
      <WarningCircleIcon className="etat__icone" weight="duotone" aria-hidden="true" />
      <div className="etat__corps">
        <p className="etat__titre">{message ?? messageErreur(error)}</p>
        {children}
        {onRetry && (
          <Button variant="outline" size="sm" iconLeft={ArrowClockwiseIcon} onClick={onRetry} className="etat__action">
            Réessayer
          </Button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ titre, icon: Icone = MagnifyingGlassIcon, action, children }) {
  return (
    <div className="etat etat--vide">
      <span className="etat__pastille" aria-hidden="true">
        <Icone weight="duotone" />
      </span>
      {titre && <p className="etat__titre">{titre}</p>}
      {children && <div className="etat__texte">{children}</div>}
      {action && <div className="etat__action">{action}</div>}
    </div>
  );
}
