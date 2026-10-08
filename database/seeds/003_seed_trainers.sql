-- =============================================================================
-- Seed 003 : formateurs
-- =============================================================================

BEGIN;

INSERT INTO trainers (
  first_name,
  last_name,
  email,
  phone,
  specialty,
  bio,
  status
)
VALUES
  (
    'Aminata',
    'Diallo',
    'aminata.diallo@schoolbooks.example',
    '+2250701020304',
    'Mathématiques',
    'Professeure de mathématiques au collège et au lycée.',
    'active'
  ),
  (
    'Koffi',
    'Yao',
    'koffi.yao@schoolbooks.example',
    '+2250705060708',
    'Français',
    'Enseignant spécialisé en français et littérature.',
    'active'
  ),
  (
    'Fatou',
    'Koné',
    'fatou.kone@schoolbooks.example',
    '+2250709101112',
    'Informatique',
    'Formatrice en algorithmique et programmation.',
    'active'
  ),
  (
    'Moussa',
    'Traoré',
    'moussa.traore@schoolbooks.example',
    '+2250713141516',
    'Physique-Chimie',
    'Professeur de physique-chimie.',
    'active'
  ),
  (
    'Aïcha',
    'Sow',
    'aicha.sow@schoolbooks.example',
    '+2250717181920',
    'Histoire-Géographie',
    'Enseignante d’histoire-géographie.',
    'active'
  )
ON CONFLICT DO NOTHING;

COMMIT;