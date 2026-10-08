-- =============================================================================
-- Seed 004 : apprenants
-- =============================================================================

BEGIN;

INSERT INTO learners (
  first_name,
  last_name,
  email,
  phone,
  birth_date,
  school_level_id,
  class_group,
  status
)
VALUES
  (
    'Ibrahim',
    'Camara',
    'ibrahim.camara@student.schoolbooks.example',
    '+2250501020304',
    '2014-03-15',
    (SELECT id FROM school_levels WHERE code = '6E'),
    'A',
    'active'
  ),
  (
    'Mariam',
    'Diop',
    'mariam.diop@student.schoolbooks.example',
    '+2250505060708',
    '2011-07-22',
    (SELECT id FROM school_levels WHERE code = '3E'),
    'B',
    'active'
  ),
  (
    'Jean',
    'Kouassi',
    'jean.kouassi@student.schoolbooks.example',
    '+2250509101112',
    '2009-11-05',
    (SELECT id FROM school_levels WHERE code = '2NDE'),
    'A',
    'active'
  ),
  (
    'Awa',
    'Bamba',
    'awa.bamba@student.schoolbooks.example',
    '+2250513141516',
    '2008-02-18',
    (SELECT id FROM school_levels WHERE code = '1ERE'),
    'C',
    'active'
  ),
  (
    'Patrick',
    'N''Guessan',
    'patrick.nguessan@student.schoolbooks.example',
    '+2250517181920',
    '2007-09-30',
    (SELECT id FROM school_levels WHERE code = 'TLE'),
    'B',
    'active'
  ),
  (
    'Esther',
    'Adjoua',
    'esther.adjoua@student.schoolbooks.example',
    '+2250521222324',
    '2006-05-12',
    (SELECT id FROM school_levels WHERE code = 'UNIV'),
    'L1 Informatique',
    'active'
  ),
  (
    'David',
    'Kouamé',
    'david.kouame@student.schoolbooks.example',
    '+2250525262728',
    '2015-12-01',
    (SELECT id FROM school_levels WHERE code = 'CM2'),
    'A',
    'active'
  ),
  (
    'Ruth',
    'Yao',
    'ruth.yao@student.schoolbooks.example',
    '+2250529303132',
    '2017-04-20',
    (SELECT id FROM school_levels WHERE code = 'CE1'),
    'B',
    'active'
  )
ON CONFLICT DO NOTHING;

COMMIT;