-- =============================================================================
-- Seed 005 : livres scolaires
-- =============================================================================

BEGIN;

INSERT INTO books (
  title,
  author,
  isbn,
  category,
  description,
  school_level_id,
  subject_id,
  trainer_id,
  file_name,
  file_path,
  file_size,
  mime_type,
  download_count,
  is_active
)
VALUES
  (
    'Mathématiques 6e - Manuel de l''élève',
    'Aminata Diallo',
    '978-2-123456-01-1',
    'Manuel',
    'Manuel de mathématiques pour la classe de 6e.',
    (SELECT id FROM school_levels WHERE code = '6E'),
    (SELECT id FROM subjects WHERE code = 'MATH'),
    (SELECT id FROM trainers WHERE email = 'aminata.diallo@schoolbooks.example'),
    'math-6e-manuel.pdf',
    'math-6e-manuel.pdf',
    5242880,
    'application/pdf',
    0,
    TRUE
  ),
  (
    'Mathématiques 3e - Cahier d''exercices',
    'Aminata Diallo',
    '978-2-123456-02-2',
    'Cahier d''exercices',
    'Exercices corrigés de mathématiques pour la 3e.',
    (SELECT id FROM school_levels WHERE code = '3E'),
    (SELECT id FROM subjects WHERE code = 'MATH'),
    (SELECT id FROM trainers WHERE email = 'aminata.diallo@schoolbooks.example'),
    'math-3e-exercices.pdf',
    'math-3e-exercices.pdf',
    3145728,
    'application/pdf',
    0,
    TRUE
  ),
  (
    'Français 6e - Lecture et expression',
    'Koffi Yao',
    '978-2-123456-03-3',
    'Manuel',
    'Lecture, grammaire et expression pour la 6e.',
    (SELECT id FROM school_levels WHERE code = '6E'),
    (SELECT id FROM subjects WHERE code = 'FR'),
    (SELECT id FROM trainers WHERE email = 'koffi.yao@schoolbooks.example'),
    'francais-6e-manuel.pdf',
    'francais-6e-manuel.pdf',
    4194304,
    'application/pdf',
    0,
    TRUE
  ),
  (
    'Informatique Seconde - Algorithmique',
    'Fatou Koné',
    '978-2-123456-04-4',
    'Manuel',
    'Introduction à l''algorithmique et à Python.',
    (SELECT id FROM school_levels WHERE code = '2NDE'),
    (SELECT id FROM subjects WHERE code = 'INFO'),
    (SELECT id FROM trainers WHERE email = 'fatou.kone@schoolbooks.example'),
    'info-seconde-python.pdf',
    'info-seconde-python.pdf',
    6291456,
    'application/pdf',
    0,
    TRUE
  ),
  (
    'Physique-Chimie 3e - Manuel',
    'Moussa Traoré',
    '978-2-123456-05-5',
    'Manuel',
    'Cours et travaux pratiques de physique-chimie.',
    (SELECT id FROM school_levels WHERE code = '3E'),
    (SELECT id FROM subjects WHERE code = 'PC'),
    (SELECT id FROM trainers WHERE email = 'moussa.traore@schoolbooks.example'),
    'physique-3e-manuel.pdf',
    'physique-3e-manuel.pdf',
    7340032,
    'application/pdf',
    0,
    TRUE
  ),
  (
    'Histoire-Géographie Première',
    'Aïcha Sow',
    '978-2-123456-06-6',
    'Manuel',
    'Cours d''histoire-géographie pour la Première.',
    (SELECT id FROM school_levels WHERE code = '1ERE'),
    (SELECT id FROM subjects WHERE code = 'HIST-GEO'),
    (SELECT id FROM trainers WHERE email = 'aicha.sow@schoolbooks.example'),
    'histgeo-premiere-manuel.pdf',
    'histgeo-premiere-manuel.pdf',
    8388608,
    'application/pdf',
    0,
    TRUE
  ),
  (
    'Mathématiques Terminale - Spécialité',
    'Aminata Diallo',
    '978-2-123456-07-7',
    'Manuel',
    'Manuel de mathématiques de Terminale.',
    (SELECT id FROM school_levels WHERE code = 'TLE'),
    (SELECT id FROM subjects WHERE code = 'MATH'),
    (SELECT id FROM trainers WHERE email = 'aminata.diallo@schoolbooks.example'),
    'math-terminale-specialite.pdf',
    'math-terminale-specialite.pdf',
    9437184,
    'application/pdf',
    0,
    TRUE
  ),
  (
    'Introduction à l''informatique - Licence 1',
    'Fatou Koné',
    '978-2-123456-08-8',
    'Manuel',
    'Introduction à l''informatique pour l''Université.',
    (SELECT id FROM school_levels WHERE code = 'UNIV'),
    (SELECT id FROM subjects WHERE code = 'INFO'),
    (SELECT id FROM trainers WHERE email = 'fatou.kone@schoolbooks.example'),
    'info-licence1-intro.pdf',
    'info-licence1-intro.pdf',
    10485760,
    'application/pdf',
    0,
    TRUE
  )
ON CONFLICT DO NOTHING;

COMMIT;