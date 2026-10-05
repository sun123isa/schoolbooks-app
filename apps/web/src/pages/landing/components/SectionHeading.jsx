// =============================================================================
// Landing page — en-tête de section aligné à gauche (sur-titre, titre h2, texte)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// `sombre` : variante pour les sections sur fond vert foncé.
// =============================================================================

export function Surtitre({ children, sombre = false }) {
  return <p className={`surtitre ${sombre ? 'surtitre--sombre' : ''}`.trim()}>{children}</p>;
}

export function SectionHeading({ id, surtitre, titre, texte, sombre = false }) {
  return (
    <div className={`section-heading ${sombre ? 'section-heading--sombre' : ''}`.trim()}>
      <Surtitre sombre={sombre}>{surtitre}</Surtitre>
      <h2 id={id} className="section-heading__title">
        {Array.isArray(titre)
          ? titre.map((ligne, index) => (
              <span key={ligne} className="section-heading__line">
                {index > 0 && ' '}
                {ligne}
              </span>
            ))
          : titre}
      </h2>
      {texte && <p className="section-heading__text">{texte}</p>}
    </div>
  );
}
