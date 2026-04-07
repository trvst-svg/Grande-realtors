-- Seed sales handlers (agents) for testing

INSERT INTO users (
  public_id,
  firstname,
  lastname,
  number,
  email,
  password,
  role_id,
  citizenship_front,
  citizenship_back,
  approval_status,
  approved_at
)
SELECT
  'seed-agent-1',
  'Sita',
  'Shrestha',
  '9800000011',
  'seed.agent1@granderealtors.dev',
  '$2b$10$nB3l4ee0AskDHRHhw2sPneQKykHetf7U3OZXHTEZH95dFuIs3GrDG',
  (SELECT id FROM roles WHERE name = 'agent'),
  '/uploads/users/seed-agent1-front.jpg',
  '/uploads/users/seed-agent1-back.jpg',
  'approved',
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM users
  WHERE email = 'seed.agent1@granderealtors.dev'
     OR public_id = 'seed-agent-1'
);

INSERT INTO users (
  public_id,
  firstname,
  lastname,
  number,
  email,
  password,
  role_id,
  citizenship_front,
  citizenship_back,
  approval_status,
  approved_at
)
SELECT
  'seed-agent-2',
  'Nabin',
  'Koirala',
  '9800000012',
  'seed.agent2@granderealtors.dev',
  '$2b$10$nB3l4ee0AskDHRHhw2sPneQKykHetf7U3OZXHTEZH95dFuIs3GrDG',
  (SELECT id FROM roles WHERE name = 'agent'),
  '/uploads/users/seed-agent2-front.jpg',
  '/uploads/users/seed-agent2-back.jpg',
  'approved',
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM users
  WHERE email = 'seed.agent2@granderealtors.dev'
     OR public_id = 'seed-agent-2'
);
