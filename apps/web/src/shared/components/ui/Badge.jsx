// =============================================================================
// Socle frontend — badge / pastille en forme de pilule
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Tons : neutral (gris), primary (vert plein), accent (vert clair),
//        accent-solid (vert clair plein), success (vert clair), outline (blanc bordé).
// =============================================================================
import './ui.css';

export function Badge({ tone = 'neutral', icon: Icon, uppercase = false, className = '', children }) {
  return (
    <span className={`badge badge--${tone} ${uppercase ? 'badge--upper' : ''} ${className}`.trim()}>
      {Icon && <Icon className="badge__icon" weight="bold" aria-hidden="true" />}
      {children}
    </span>
  );
}
