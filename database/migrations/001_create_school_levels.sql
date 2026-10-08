-- =============================================================================
-- Migration 001 : création des niveaux scolaires
-- =============================================================================

-- Active pgcrypto afin de pouvoir générer des UUID automatiquement.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crée la table des niveaux scolaires.
CREATE TABLE IF NOT EXISTS school_levels (
  -- Identifiant unique du niveau.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Nom affiché dans l'application.
  name VARCHAR(100) NOT NULL,

  -- Code court utilisé dans les filtres et l'API.
  code VARCHAR(30) NOT NULL,

  -- Cycle scolaire : Primaire, Collège, Lycée ou Université.
  education_cycle VARCHAR(50) NOT NULL,

  -- Ordre officiel d'affichage dans les listes.
  display_order INTEGER NOT NULL,

  -- Permet de désactiver un niveau sans le supprimer.
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Date de création.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Date de modification.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Deux niveaux ne peuvent pas avoir le même nom.
  CONSTRAINT school_levels_name_unique UNIQUE (name),

  -- Deux niveaux ne peuvent pas avoir le même code.
  CONSTRAINT school_levels_code_unique UNIQUE (code),

  -- Deux niveaux ne peuvent pas avoir le même ordre.
  CONSTRAINT school_levels_order_unique UNIQUE (display_order),

  -- L'ordre doit être positif.
  CONSTRAINT school_levels_order_check CHECK (display_order > 0)
);

-- Index pour récupérer rapidement les niveaux actifs.
CREATE INDEX IF NOT EXISTS idx_school_levels_active
ON school_levels (is_active);

-- Index pour trier et filtrer par cycle scolaire.
CREATE INDEX IF NOT EXISTS idx_school_levels_cycle
ON school_levels (education_cycle);

-- Index pour le tri d'affichage.
CREATE INDEX IF NOT EXISTS idx_school_levels_order
ON school_levels (display_order);