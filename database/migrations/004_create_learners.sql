-- =============================================================================
-- Migration 004 : création des apprenants
-- =============================================================================

-- Crée la table des apprenants.
CREATE TABLE IF NOT EXISTS learners (
  -- Identifiant unique de l'apprenant.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Prénom obligatoire.
  first_name VARCHAR(100) NOT NULL,

  -- Nom obligatoire.
  last_name VARCHAR(100) NOT NULL,

  -- Adresse e-mail unique.
  email VARCHAR(255) NOT NULL UNIQUE,

  -- Téléphone facultatif.
  phone VARCHAR(30),

  -- Date de naissance facultative.
  birth_date DATE,

  -- Relation vers le niveau scolaire.
  school_level_id UUID NOT NULL,

  -- Classe ou groupe.
  class_group VARCHAR(50),

  -- Statut de l'apprenant.
  status VARCHAR(30) NOT NULL DEFAULT 'active',

  -- Date de création.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Date de modification.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Clé étrangère vers school_levels.
  CONSTRAINT learners_school_level_fk
  FOREIGN KEY (school_level_id)
  REFERENCES school_levels(id)
  ON DELETE RESTRICT,

  -- Limite les valeurs possibles du statut.
  CONSTRAINT learners_status_check
  CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Index pour les recherches par niveau.
CREATE INDEX IF NOT EXISTS idx_learners_school_level
ON learners (school_level_id);

-- Index pour les recherches par statut.
CREATE INDEX IF NOT EXISTS idx_learners_status
ON learners (status);

-- Index pour les noms.
CREATE INDEX IF NOT EXISTS idx_learners_name
ON learners (last_name, first_name);