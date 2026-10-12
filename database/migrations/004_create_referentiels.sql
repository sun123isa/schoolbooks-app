-- =============================================================================
-- Migration 004 : création des référentiels du catalogue
-- Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
-- Tables : levels (niveaux), tracks (séries/filières), subjects (matières),
--          document_types (types de documents).
-- Convention : noms SQL en anglais (comme les migrations 001 à 003) ; l'API
-- expose ces données en français (code, libelle...) via le contrat partagé.
-- Chaque référentiel possède un `code` lisible, utilisé dans les URL
-- (ex : /recherche?niveau=lycee&filiere=serie-c).
-- Migration idempotente : peut être rejouée sans erreur.
-- =============================================================================

-- Niveaux d'études (MVP : lycée et université).
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  -- Code lisible et stable : minuscules, chiffres, tirets.
  code VARCHAR(50) NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label VARCHAR(100) NOT NULL,
  -- Ordre d'affichage dans les listes (landing page, filtres).
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Séries (lycée) et filières (université). Chaque série/filière appartient à un
-- seul niveau : c'est la base de la règle BR02.
CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label VARCHAR(150) NOT NULL,
  level_id INTEGER NOT NULL REFERENCES levels(id) ON DELETE RESTRICT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Permet à books de référencer le couple (filière, niveau) : voir migration 005.
  CONSTRAINT uq_tracks_id_level UNIQUE (id, level_id)
);

CREATE INDEX IF NOT EXISTS idx_tracks_level_id ON tracks (level_id);

-- Matières.
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Types de documents (sujet d'examen, corrigé, livre, support de cours...).
CREATE TABLE IF NOT EXISTS document_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label VARCHAR(100) NOT NULL,
  -- BR04 : TRUE pour les types qui exigent une année (sujets d'examen, corrigés).
  requires_year BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
