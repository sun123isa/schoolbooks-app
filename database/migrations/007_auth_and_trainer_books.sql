-- =============================================================================
-- Migration 007 : comptes (apprenants, formateurs), sessions et livres des formateurs
-- Prérequis : migrations 001 à 006.
-- Utilisée par apps/api/src/modules/auth (inscription, connexion, refresh token)
-- et apps/api/src/modules/books (livres publiés par les formateurs).
--   - learners / trainers : mot de passe haché (scrypt) et dernière connexion ;
--   - refresh_tokens : un jeton de rafraîchissement par session, stocké haché
--     (SHA-256), révocable (déconnexion, rotation à chaque /refresh) ;
--   - books : date de désactivation (corbeille du formateur).
-- Les comptes historiques (seed 001) n'ont pas de mot de passe : ils ne
-- peuvent pas se connecter tant qu'ils ne se réinscrivent pas.
-- Migration idempotente : peut être rejouée.
-- =============================================================================

ALTER TABLE learners
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Adresse e-mail unique sans tenir compte de la casse (connexion insensible à la casse).
CREATE UNIQUE INDEX IF NOT EXISTS uq_learners_email_lower ON learners (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS uq_trainers_email_lower ON trainers (lower(email));

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Compte propriétaire : apprenant ou formateur (deux tables distinctes).
  user_id UUID NOT NULL,
  user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('learner', 'trainer')),
  -- SHA-256 du jeton : un vol de la base ne permet pas de rejouer les sessions.
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_role, user_id);

-- Corbeille : date à laquelle le formateur a désactivé le livre (NULL = actif).
ALTER TABLE books ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;

-- Tableau de bord formateur : livres d'un formateur, du plus récent au plus ancien.
CREATE INDEX IF NOT EXISTS idx_books_trainer_created ON books (trainer_id, created_at DESC);
