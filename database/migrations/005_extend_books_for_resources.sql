-- =============================================================================
-- Migration 005 : extension de la table books pour porter les « ressources »
-- Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
-- Décision d'architecture : la table books existante devient le catalogue des
-- ressources (sujets d'examens, corrigés, livres, supports de cours...).
-- Les colonnes historiques (level, subject, category en texte libre) sont
-- conservées pour ne pas casser /api/books ; les nouvelles routes /api/ressources
-- s'appuient sur les clés étrangères ajoutées ici.
--
-- Une ressource est « publiée » (visible par la recherche et la fiche) si :
--   is_active = TRUE AND level_id, subject_id, document_type_id IS NOT NULL
-- Les livres historiques sans référentiel ne sont donc pas exposés.
--
-- Règles métier garanties ici : BR02 (clé étrangère composite), BR09
-- (empreinte unique). BR01/BR03/BR04/BR05/BR10 sont contrôlées à l'intégration
-- au catalogue (apps/api/src/modules/ressources/catalogue.validator.js).
-- Migration idempotente : peut être rejouée sans erreur.
-- =============================================================================

ALTER TABLE books
  -- BR01 : niveau (obligatoire pour une ressource publiée).
  ADD COLUMN IF NOT EXISTS level_id INTEGER REFERENCES levels(id) ON DELETE RESTRICT,
  -- BR02 : série/filière facultative, mais forcément du même niveau (voir contrainte plus bas).
  ADD COLUMN IF NOT EXISTS track_id INTEGER,
  -- BR03 : matière (obligatoire pour une ressource publiée).
  ADD COLUMN IF NOT EXISTS subject_id INTEGER REFERENCES subjects(id) ON DELETE RESTRICT,
  -- BR05 : type de document (obligatoire pour une ressource publiée).
  ADD COLUMN IF NOT EXISTS document_type_id INTEGER REFERENCES document_types(id) ON DELETE RESTRICT,
  -- BR04 : année (obligatoire pour les types requires_year = TRUE).
  ADD COLUMN IF NOT EXISTS year SMALLINT,
  -- BR08 : téléchargement autorisé ? FALSE par défaut (prudence, BR10).
  ADD COLUMN IF NOT EXISTS is_downloadable BOOLEAN NOT NULL DEFAULT FALSE,
  -- BR10 : droits d'utilisation (source, licence, ayant droit).
  ADD COLUMN IF NOT EXISTS usage_rights TEXT,
  -- BR09 : empreinte SHA-256 du fichier, pour détecter les doublons.
  ADD COLUMN IF NOT EXISTS file_checksum CHAR(64);

DO $$
BEGIN
  -- BR02 : le couple (track_id, level_id) doit exister dans tracks.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_books_track_level') THEN
    ALTER TABLE books
      ADD CONSTRAINT fk_books_track_level
      FOREIGN KEY (track_id, level_id) REFERENCES tracks (id, level_id) ON DELETE RESTRICT;
  END IF;

  -- Une filière sans niveau échapperait à la contrainte ci-dessus : on l'interdit.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_books_track_requires_level') THEN
    ALTER TABLE books
      ADD CONSTRAINT chk_books_track_requires_level CHECK (track_id IS NULL OR level_id IS NOT NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_books_year_range') THEN
    ALTER TABLE books
      ADD CONSTRAINT chk_books_year_range CHECK (year IS NULL OR year BETWEEN 1950 AND 2100);
  END IF;
END $$;

-- BR09 : un même fichier ne peut pas être intégré deux fois.
CREATE UNIQUE INDEX IF NOT EXISTS uq_books_file_checksum ON books (file_checksum) WHERE file_checksum IS NOT NULL;

-- Index de base pour les filtres. L'optimisation de la recherche (plein texte,
-- index composites) relève du module recherche (Salem) via une migration dédiée.
CREATE INDEX IF NOT EXISTS idx_books_level_id ON books (level_id);
CREATE INDEX IF NOT EXISTS idx_books_track_id ON books (track_id);
CREATE INDEX IF NOT EXISTS idx_books_subject_id ON books (subject_id);
CREATE INDEX IF NOT EXISTS idx_books_document_type_id ON books (document_type_id);
CREATE INDEX IF NOT EXISTS idx_books_year ON books (year);
