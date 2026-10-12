// =============================================================================
// Socle frontend — icône d'un type de document (référentiel types-documents)
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Utilisée par la landing, la recherche et la consultation : une seule
// correspondance code → icône pour toute l'application.
// Usage : <IconeType code="sujet-examen" className="…" />
// =============================================================================
import {
  BookOpenTextIcon,
  ExamIcon,
  FileTextIcon,
  NotePencilIcon,
  PresentationChartIcon,
  SealCheckIcon
} from '@phosphor-icons/react';

export const ICONES_TYPES = {
  'sujet-examen': ExamIcon,
  corrige: SealCheckIcon,
  livre: BookOpenTextIcon,
  cours: PresentationChartIcon,
  exercices: NotePencilIcon
};

export function IconeType({ code, weight = 'duotone', className }) {
  const Icone = ICONES_TYPES[code] ?? FileTextIcon;
  return <Icone weight={weight} className={className} aria-hidden="true" />;
}
