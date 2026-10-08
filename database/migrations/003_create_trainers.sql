-- =============================================================================
-- Migration 003 : création des formateurs
-- =============================================================================

-- Crée la table des formateurs.
CREATE TABLE IF NOT EXISTS trainers (
  -- Identifiant unique du formateur.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Prénom obligatoire.
  first_name VARCHAR(100) NOT NULL,

  -- Nom obligatoire.
  last_name VARCHAR(100) NOT NULL,

  -- E-mail unique du formateur.
  email VARCHAR(255) NOT NULL UNIQUE,

  -- Téléphone facultatif.
  phone VARCHAR(30),

  -- Spécialité principale.
  specialty VARCHAR(100) NOT NULL,

  -- Biographie facultative.
  bio TEXT,

  -- Statut du formateur.
  status VARCHAR(30) NOT NULL DEFAULT 'active',

  -- Date de création.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Date de modification.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Limite les statuts aux valeurs prévues.
  CONSTRAINT trainers_status_check
  CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Index sur la spécialité.
CREATE INDEX IF NOT EXISTS idx_trainers_specialty
ON trainers (specialty);

-- Index sur le statut.
CREATE INDEX IF NOT EXISTS idx_trainers_status
ON trainers (status);