-- =============================================================================
-- Migration 008 : référentiels de base (niveaux, séries/filières, matières, types)
-- Prérequis : migrations 001 à 007.
-- Les référentiels sont indispensables au fonctionnement (inscription, ajout de
-- livre, filtres) : ils sont désormais posés par une migration, et une base de
-- production se prépare avec `npm run db:migrate` SANS `--seed`.
-- Les seeds (database/seeds) ne contiennent que des données de démonstration,
-- réservées au développement local.
-- Mêmes codes que le seed 002 : migration idempotente (ON CONFLICT DO NOTHING).
-- =============================================================================

BEGIN;

INSERT INTO levels (code, label, sort_order) VALUES
  ('lycee', 'Lycée', 1),
  ('universite', 'Université', 2)
ON CONFLICT (code) DO NOTHING;

INSERT INTO tracks (code, label, level_id, sort_order)
SELECT v.code, v.label, l.id, v.sort_order
FROM (VALUES
  ('serie-a', 'Série A — Lettres et philosophie', 'lycee', 1),
  ('serie-c', 'Série C — Mathématiques et sciences physiques', 'lycee', 2),
  ('serie-d', 'Série D — Sciences de la vie et de la Terre', 'lycee', 3),
  ('licence-informatique', 'Licence Informatique', 'universite', 1),
  ('licence-economie', 'Licence Sciences économiques', 'universite', 2),
  ('licence-droit', 'Licence Droit', 'universite', 3)
) AS v(code, label, level_code, sort_order)
JOIN levels l ON l.code = v.level_code
ON CONFLICT (code) DO NOTHING;

INSERT INTO subjects (code, label) VALUES
  ('anglais', 'Anglais'),
  ('droit', 'Droit'),
  ('economie', 'Économie'),
  ('francais', 'Français'),
  ('histoire-geographie', 'Histoire-Géographie'),
  ('informatique', 'Informatique'),
  ('mathematiques', 'Mathématiques'),
  ('philosophie', 'Philosophie'),
  ('physique-chimie', 'Physique-Chimie'),
  ('svt', 'Sciences de la vie et de la Terre')
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, label, requires_year, sort_order) VALUES
  ('sujet-examen', 'Sujet d''examen', TRUE, 1),
  ('corrige', 'Corrigé d''examen', TRUE, 2),
  ('livre', 'Livre', FALSE, 3),
  ('cours', 'Support de cours', FALSE, 4),
  ('exercices', 'Fiches d''exercices', FALSE, 5)
ON CONFLICT (code) DO NOTHING;


COMMIT;
