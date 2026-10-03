// =============================================================================
// Socle frontend — lien vers une page qui n'existe pas (encore)
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// LIEN INACTIF : affiché pour respecter la maquette, sans navigation.
// Rechercher « InactiveLink » dans le code pour lister ces liens ; les remplacer
// par <Link to=...> quand la page existe.
// =============================================================================

export function InactiveLink({ className = '', children, raison = 'Bientôt disponible' }) {
  return (
    <span className={`link-inactive ${className}`.trim()} aria-disabled="true" title={raison}>
      {children}
    </span>
  );
}
