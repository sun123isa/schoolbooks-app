// =============================================================================
// Socle frontend — bouton (lien interne, ou <button>)
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Variantes : primary (bleu plein), outline (contour), accent (ambre plein).
// Tailles : md (par défaut), sm. Icônes lucide-react via iconLeft / iconRight.
// Usage : <Button to={cheminRecherche()} iconLeft={Search}>Trouver</Button>
// =============================================================================
import { Link } from 'react-router-dom';
import './ui.css';

export function Button({
  to,
  variant = 'primary',
  size = 'md',
  iconLeft: IconLeft,
  iconRight: IconRight,
  className = '',
  children,
  ...rest
}) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();
  const contenu = (
    <>
      {IconLeft && <IconLeft className="btn__icon" aria-hidden="true" />}
      <span>{children}</span>
      {IconRight && <IconRight className="btn__icon btn__icon--right" aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {contenu}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {contenu}
    </button>
  );
}
