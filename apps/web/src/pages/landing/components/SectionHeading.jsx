// =============================================================================
// Landing page — en-tête de section centré (badge ou sur-titre, titre h2, sous-titre)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// =============================================================================

export function SectionHeading({ id, surtitre, badge, titre, sousTitre }) {
  return (
    <div className="section-heading">
      {badge}
      {surtitre && <p className="section-heading__overline">{surtitre}</p>}
      <h2 id={id} className="section-heading__title">
        {titre}
      </h2>
      {sousTitre && <p className="section-heading__subtitle">{sousTitre}</p>}
    </div>
  );
}
