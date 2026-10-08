-- =============================================================================
-- Migration 006 : ajout de l'authentification aux apprenants et formateurs
-- =============================================================================

-- Ajoute le hash du mot de passe aux apprenants.
ALTER TABLE learners
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Ajoute la date de vérification de l'e-mail.
ALTER TABLE learners
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Ajoute la date de dernière connexion.
ALTER TABLE learners
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Ajoute le hash du mot de passe aux formateurs.
ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Ajoute la date de vérification de l'e-mail.
ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Ajoute la date de dernière connexion.
ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Crée une table séparée pour les refresh tokens.
-- Le token lui-même ne sera pas stocké en clair.
CREATE TABLE IF NOT EXISTS refresh_tokens (
  -- Identifiant de la session.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hash du refresh token.
  token_hash TEXT NOT NULL UNIQUE,

  -- Type de compte concerné.
  account_type VARCHAR(20) NOT NULL,

  -- ID du learner ou trainer.
  account_id UUID NOT NULL,

  -- Date d'expiration du refresh token.
  expires_at TIMESTAMPTZ NOT NULL,

  -- Date de révocation éventuelle.
  revoked_at TIMESTAMPTZ,

  -- Date de création.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Vérifie les types autorisés.
  CONSTRAINT refresh_tokens_account_type_check
  CHECK (account_type IN ('learner', 'trainer'))
);

-- Index pour retrouver rapidement les sessions d'un compte.
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_account
ON refresh_tokens (account_type, account_id);

-- Index pour supprimer ou vérifier les tokens expirés.
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at
ON refresh_tokens (expires_at);