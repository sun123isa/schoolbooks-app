-- =============================================================================
-- Seed 003 : vrais sujets du baccalauréat congolais
-- Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
-- Prérequis : migrations 001 à 006, seed 002 (référentiels).
-- Mêmes ressources que les identifiants ...0012 à ...0015 des données fictives
-- (packages/shared/src/mocks/ressources.mock.js). Les PDF sont copiés depuis
-- apps/web/public/mocks/ dans STORAGE_DIR par : npm run storage:demo
-- Téléchargement désactivé (BR10, interdit par défaut) tant que l'autorisation
-- de diffusion de l'auteur n'est pas confirmée.
-- Seed idempotent : peut être rejoué sans créer de doublons.
-- =============================================================================

BEGIN;

INSERT INTO books (
  title, author, description, level, subject, category,
  file_name, file_path, file_size, mime_type, file_checksum, is_active,
  level_id, track_id, subject_id, document_type_id, year, is_downloadable, usage_rights
)
SELECT
  v.title, a.author, v.description, l.label, s.label, d.label,
  regexp_replace(v.file_path, '^.*/', ''), v.file_path, v.file_size, 'application/pdf', v.file_checksum, TRUE,
  l.id, t.id, s.id, d.id, v.year, FALSE, a.usage_rights
FROM (VALUES
  ('Baccalauréat série A 2016 — Mathématiques (sujet)'::text,
   'Sujet de mathématiques du baccalauréat série A, session 2016 (République du Congo).'::text,
   'serie-a'::text, 'mathematiques'::text, 'sujet-examen'::text, 2016::smallint,
   'ressources/bac-a-2016-mathematiques-sujet.pdf'::text, 54142::bigint,
   'a8f4260dd2f2cb32ec1b9398858505521ba699edb23ca7c5bdd08a3f5cfbf747'::char(64)),
  ('Baccalauréat série C 2017 — Physique-Chimie (sujet)',
   'Sujet de physique-chimie du baccalauréat série C, session 2017 (République du Congo) : chimie et physique.',
   'serie-c', 'physique-chimie', 'sujet-examen', 2017,
   'ressources/bac-c-2017-physique-chimie-sujet.pdf', 78399,
   'a7c37aee3ab1cf12d80feb7ab44186c45b98a67655254672895c6cca3848bced'),
  ('Baccalauréat série A 2020 — Mathématiques (corrigé)',
   'Corrigé détaillé, exercice par exercice, du sujet de mathématiques du baccalauréat série A, session 2020.',
   'serie-a', 'mathematiques', 'corrige', 2020,
   'ressources/bac-a-2020-mathematiques-corrige.pdf', 75492,
   '95dc57f5ae7ac1dfbf3c7da1585c4f5346a589b79783d571b5c67e033d6713f7'),
  ('Baccalauréat série C 2020 — Mathématiques (sujet)',
   'Sujet de mathématiques du baccalauréat série C, session 2020 (République du Congo).',
   'serie-c', 'mathematiques', 'sujet-examen', 2020,
   'ressources/bac-c-2020-mathematiques-sujet.pdf', 55626,
   '7134512dccb4e9782e609eb107b1e30413d3cc7752b46b42825dd5fe9865f39a')
) AS v(title, description, track_code, subject_code, type_code, year, file_path, file_size, file_checksum)
CROSS JOIN (VALUES
  ('Valérien Eberlin (maths.congo.free.fr)'::text,
   'Publié par Valérien Eberlin sur maths.congo.free.fr — autorisation de diffusion à confirmer.'::text)
) AS a(author, usage_rights)
JOIN levels l ON l.code = 'lycee'
JOIN tracks t ON t.code = v.track_code AND t.level_id = l.id
JOIN subjects s ON s.code = v.subject_code
JOIN document_types d ON d.code = v.type_code
WHERE NOT EXISTS (
  SELECT 1 FROM books b WHERE b.file_path = v.file_path OR b.file_checksum = v.file_checksum
);

COMMIT;
