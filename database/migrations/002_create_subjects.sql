-- =============================================================================
-- Migration 002 : création des matières
-- =============================================================================

-- Crée la table des matières.
CREATE TABLE IF NOT EXISTS subjects (
  -- Identifiant unique de la matière.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Nom affiché dans l'application.
  name VARCHAR(100) NOT NULL,

  -- Code court utilisé par l'API et les filtres.
  code VARCHAR(50) NOT NULL,

  -- Description facultative.
  description TEXT,

  -- Permet de masquer une matière sans la supprimer.
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Date de création.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Date de modification.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Le nom doit être unique.
  CONSTRAINT subjects_name_unique UNIQUE (name),

  -- Le code doit être unique.
  CONSTRAINT subjects_code_unique UNIQUE (code)
);

-- Index pour les matières actives.
CREATE INDEX IF NOT EXISTS idx_subjects_active
ON subjects (is_active);

-- Index pour les recherches par nom.
CREATE INDEX IF NOT EXISTS idx_subjects_name
ON subjects (name);