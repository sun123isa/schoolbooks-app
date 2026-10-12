-- =============================================================================
-- Seed 002 : référentiels et ressources de démonstration (lycée et université)
-- Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
-- Prérequis : migrations 001 à 005.
-- Les codes sont identiques aux données fictives de packages/shared/src/mocks :
-- le frontend obtient les mêmes filtres en mode mock et en mode API réelle.
-- Les fichiers PDF sont générés par : npm run storage:demo --workspace=apps/api
-- Seed idempotent : peut être rejoué sans créer de doublons.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Référentiels
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 2. Ressources (stockées dans books, voir migration 005)
-- file_path est relatif à STORAGE_DIR. Le fichier « ...-manquant.pdf » n'est
-- volontairement pas généré : il sert à tester le cas « PDF inaccessible » (BR06).
-- -----------------------------------------------------------------------------
INSERT INTO books (
  title, author, description, level, subject, category,
  file_name, file_path, file_size, mime_type, is_active,
  level_id, track_id, subject_id, document_type_id, year, is_downloadable, usage_rights
)
SELECT
  v.title, v.author, v.description, l.label, s.label, d.label,
  regexp_replace(v.file_path, '^.*/', ''), v.file_path, v.file_size, 'application/pdf', TRUE,
  l.id, t.id, s.id, d.id, v.year, v.is_downloadable, v.usage_rights
FROM (VALUES
  ('Baccalauréat série C 2023 — Mathématiques (sujet)'::text, 'Direction des examens et concours'::text,
   'Sujet officiel de l''épreuve de mathématiques du baccalauréat série C, session 2023.'::text,
   'lycee'::text, 'serie-c'::text, 'mathematiques'::text, 'sujet-examen'::text, 2023::smallint, TRUE,
   'Document officiel — diffusion libre à usage éducatif.'::text, 'ressources/bac-c-2023-mathematiques-sujet.pdf'::text, 412000::bigint),
  ('Baccalauréat série C 2023 — Mathématiques (corrigé)', 'Équipe pédagogique Schoolbooks',
   'Corrigé détaillé, exercice par exercice, du sujet de mathématiques 2023.',
   'lycee', 'serie-c', 'mathematiques', 'corrige', 2023, TRUE,
   'Rédigé par l''équipe — licence CC BY-NC 4.0.', 'ressources/bac-c-2023-mathematiques-corrige.pdf', 655000),
  ('Baccalauréat série D 2022 — SVT (sujet)', 'Direction des examens et concours',
   'Sujet de sciences de la vie et de la Terre, baccalauréat série D, session 2022.',
   'lycee', 'serie-d', 'svt', 'sujet-examen', 2022, TRUE,
   'Document officiel — diffusion libre à usage éducatif.', 'ressources/bac-d-2022-svt-sujet.pdf', 380000),
  ('Baccalauréat série A 2024 — Philosophie (sujet)', 'Direction des examens et concours',
   'Sujets de dissertation et commentaire de texte, session 2024. Consultation en ligne uniquement.',
   'lycee', 'serie-a', 'philosophie', 'sujet-examen', 2024, FALSE,
   'Consultation seule — reproduction soumise à l''accord de l''ayant droit.', 'ressources/bac-a-2024-philosophie-sujet.pdf', 210000),
  ('Physique-Chimie Terminale C — Manuel', 'Moussa Traoré',
   'Manuel de référence couvrant le programme de Terminale C.',
   'lycee', 'serie-c', 'physique-chimie', 'livre', NULL, FALSE,
   'Ouvrage sous droits — consultation en ligne autorisée par l''éditeur.', 'ressources/physique-chimie-terminale-c-manuel.pdf', 7340032),
  ('Méthodologie de la dissertation — Français', 'Koffi Yao',
   'Support de cours sur la méthode de la dissertation, valable pour toutes les séries.',
   'lycee', NULL, 'francais', 'cours', NULL, TRUE,
   'Licence CC BY 4.0.', 'ressources/methodologie-dissertation-francais.pdf', 980000),
  ('Algorithmique — Licence 1 Informatique (cours)', 'Fatou Koné',
   'Cours d''introduction à l''algorithmique : variables, structures de contrôle, tableaux, complexité.',
   'universite', 'licence-informatique', 'informatique', 'cours', NULL, TRUE,
   'Licence CC BY-SA 4.0.', 'ressources/algorithmique-l1-cours.pdf', 2400000),
  ('Examen final 2023 — Algorithmique L1 (sujet)', 'Faculté des sciences',
   'Sujet de l''examen final d''algorithmique, première année de licence, session 2023.',
   'universite', 'licence-informatique', 'informatique', 'sujet-examen', 2023, TRUE,
   'Diffusion autorisée par la faculté à usage éducatif.', 'ressources/examen-2023-algorithmique-l1-sujet.pdf', 320000),
  ('Microéconomie — Fiches d''exercices L1', 'Département d''économie',
   'Exercices d''application sur l''offre, la demande et l''équilibre de marché.',
   'universite', 'licence-economie', 'economie', 'exercices', NULL, FALSE,
   'Consultation seule.', 'ressources/microeconomie-l1-exercices.pdf', 540000),
  ('Baccalauréat série D 2021 — Anglais (sujet)', 'Direction des examens et concours',
   'Sujet d''anglais du baccalauréat série D, session 2021.',
   'lycee', 'serie-d', 'anglais', 'sujet-examen', 2021, TRUE,
   'Document officiel — diffusion libre à usage éducatif.', 'ressources/bac-d-2021-anglais-sujet.pdf', 260000),
  ('Baccalauréat série A 2020 — Histoire-Géographie (sujet)', 'Direction des examens et concours',
   'Sujet d''histoire-géographie, session 2020. Fichier temporairement indisponible.',
   'lycee', 'serie-a', 'histoire-geographie', 'sujet-examen', 2020, TRUE,
   'Document officiel — diffusion libre à usage éducatif.', 'ressources/bac-a-2020-histoire-geographie-sujet-manquant.pdf', NULL)
) AS v(title, author, description, level_code, track_code, subject_code, type_code, year, is_downloadable, usage_rights, file_path, file_size)
JOIN levels l ON l.code = v.level_code
LEFT JOIN tracks t ON t.code = v.track_code
JOIN subjects s ON s.code = v.subject_code
JOIN document_types d ON d.code = v.type_code
WHERE NOT EXISTS (SELECT 1 FROM books b WHERE b.file_path = v.file_path);

COMMIT;

-- Vérification (optionnelle) : ressources publiées avec leurs référentiels.
-- SELECT b.title, l.code AS niveau, t.code AS filiere, s.code AS matiere, d.code AS type, b.year, b.is_downloadable
-- FROM books b
-- JOIN levels l ON l.id = b.level_id
-- LEFT JOIN tracks t ON t.id = b.track_id
-- JOIN subjects s ON s.id = b.subject_id
-- JOIN document_types d ON d.id = b.document_type_id
-- WHERE b.is_active
-- ORDER BY l.sort_order, b.year DESC NULLS LAST;
