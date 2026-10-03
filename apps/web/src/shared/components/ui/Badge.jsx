// =============================================================================
// Socle frontend — badge / pastille en forme de pilule
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Tons : neutral (gris), primary (bleu plein), accent (ambre clair),
//        accent-solid (ambre plein), success (vert clair), outline (blanc bordé).
// =============================================================================
import './ui.css';

export function Badge({ tone = 'neutral', icon: Icon, uppercase = false, className = '', children }) {
  return (
    <span className={`badge badge--${tone} ${uppercase ? 'badge--upper' : ''} ${className}`.trim()}>
      {Icon && <Icon className="badge__icon" aria-hidden="true" />}
      {children}
    </span>
  );
}
