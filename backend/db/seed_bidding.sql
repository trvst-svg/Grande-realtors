-- Seed data for bidding/auctions

-- Seed users (owner + bidder)
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
  'seed-owner-1',
  'Seed',
  'Owner',
  '9800000001',
  'seed.owner@granderealtors.dev',
  '$2b$10$nB3l4ee0AskDHRHhw2sPneQKykHetf7U3OZXHTEZH95dFuIs3GrDG',
  (SELECT id FROM roles WHERE name = 'user'),
  '/uploads/users/seed-owner-front.jpg',
  '/uploads/users/seed-owner-back.jpg',
  'approved',
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM users
  WHERE email = 'seed.owner@granderealtors.dev'
     OR public_id = 'seed-owner-1'
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
  'seed-bidder-1',
  'Seed',
  'Bidder',
  '9800000002',
  'seed.bidder@granderealtors.dev',
  '$2b$10$nB3l4ee0AskDHRHhw2sPneQKykHetf7U3OZXHTEZH95dFuIs3GrDG',
  (SELECT id FROM roles WHERE name = 'user'),
  '/uploads/users/seed-bidder-front.jpg',
  '/uploads/users/seed-bidder-back.jpg',
  'approved',
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM users
  WHERE email = 'seed.bidder@granderealtors.dev'
     OR public_id = 'seed-bidder-1'
);

-- Seed properties for auctions
INSERT INTO properties (
  public_id,
  owner_id,
  property_type_id,
  location,
  description,
  price,
  listing_purpose,
  listing_type,
  sale_status,
  listed_date
)
SELECT
  'seed-house-1',
  (SELECT id FROM users WHERE email = 'seed.owner@granderealtors.dev'),
  (SELECT id FROM property_types WHERE name = 'house'),
  'Budhanilkantha, Kathmandu',
  'Modern villa with garden and mountain views.',
  25000000,
  'sale',
  'Residential',
  'available',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM properties WHERE public_id = 'seed-house-1'
);

INSERT INTO properties (
  public_id,
  owner_id,
  property_type_id,
  location,
  description,
  price,
  listing_purpose,
  listing_type,
  sale_status,
  listed_date
)
SELECT
  'seed-house-2',
  (SELECT id FROM users WHERE email = 'seed.owner@granderealtors.dev'),
  (SELECT id FROM property_types WHERE name = 'house'),
  'Lazimpat, Kathmandu',
  'Contemporary home close to city amenities.',
  18000000,
  'sale',
  'Residential',
  'available',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM properties WHERE public_id = 'seed-house-2'
);

INSERT INTO properties (
  public_id,
  owner_id,
  property_type_id,
  location,
  description,
  price,
  listing_purpose,
  listing_type,
  sale_status,
  listed_date
)
SELECT
  'seed-land-1',
  (SELECT id FROM users WHERE email = 'seed.owner@granderealtors.dev'),
  (SELECT id FROM property_types WHERE name = 'land'),
  'Bhaktapur, Nepal',
  'Open land ideal for residential development.',
  9500000,
  'sale',
  'Residential',
  'available',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM properties WHERE public_id = 'seed-land-1'
);

-- Seed auctions
INSERT INTO auctions (property_id, start_time, end_time, starting_price, status)
SELECT
  (SELECT id FROM properties WHERE public_id = 'seed-house-1'),
  NOW() - INTERVAL '6 hours',
  NOW() + INTERVAL '6 days',
  22000000,
  'open'
WHERE NOT EXISTS (
  SELECT 1 FROM auctions
  WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-house-1')
);

INSERT INTO auctions (property_id, start_time, end_time, starting_price, status)
SELECT
  (SELECT id FROM properties WHERE public_id = 'seed-house-2'),
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '4 days',
  15000000,
  'open'
WHERE NOT EXISTS (
  SELECT 1 FROM auctions
  WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-house-2')
);

INSERT INTO auctions (property_id, start_time, end_time, starting_price, status)
SELECT
  (SELECT id FROM properties WHERE public_id = 'seed-land-1'),
  NOW() - INTERVAL '2 hours',
  NOW() + INTERVAL '3 days',
  8000000,
  'open'
WHERE NOT EXISTS (
  SELECT 1 FROM auctions
  WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-land-1')
);

-- Seed bid tickets (paid) for the bidder user
INSERT INTO bid_tickets (
  auction_id,
  user_id,
  transaction_uuid,
  amount,
  status,
  paid_at
)
SELECT
  (SELECT id FROM auctions WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-house-1')),
  (SELECT id FROM users WHERE email = 'seed.bidder@granderealtors.dev'),
  'seed-ticket-house-1',
  1000,
  'paid',
  NOW()
ON CONFLICT (auction_id, user_id)
DO UPDATE SET
  status = 'paid',
  amount = EXCLUDED.amount,
  paid_at = EXCLUDED.paid_at;

INSERT INTO bid_tickets (
  auction_id,
  user_id,
  transaction_uuid,
  amount,
  status,
  paid_at
)
SELECT
  (SELECT id FROM auctions WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-house-2')),
  (SELECT id FROM users WHERE email = 'seed.bidder@granderealtors.dev'),
  'seed-ticket-house-2',
  1000,
  'paid',
  NOW()
ON CONFLICT (auction_id, user_id)
DO UPDATE SET
  status = 'paid',
  amount = EXCLUDED.amount,
  paid_at = EXCLUDED.paid_at;

INSERT INTO bid_tickets (
  auction_id,
  user_id,
  transaction_uuid,
  amount,
  status,
  paid_at
)
SELECT
  (SELECT id FROM auctions WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-land-1')),
  (SELECT id FROM users WHERE email = 'seed.bidder@granderealtors.dev'),
  'seed-ticket-land-1',
  1000,
  'paid',
  NOW()
ON CONFLICT (auction_id, user_id)
DO UPDATE SET
  status = 'paid',
  amount = EXCLUDED.amount,
  paid_at = EXCLUDED.paid_at;

-- Seed bids to make the current price meaningful
INSERT INTO bids (auction_id, user_id, bid_amount, bid_time)
SELECT
  (SELECT id FROM auctions WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-house-1')),
  (SELECT id FROM users WHERE email = 'seed.bidder@granderealtors.dev'),
  22500000,
  NOW() - INTERVAL '5 hours'
WHERE NOT EXISTS (
  SELECT 1 FROM bids
  WHERE auction_id = (SELECT id FROM auctions WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-house-1'))
    AND user_id = (SELECT id FROM users WHERE email = 'seed.bidder@granderealtors.dev')
    AND bid_amount = 22500000
);

INSERT INTO bids (auction_id, user_id, bid_amount, bid_time)
SELECT
  (SELECT id FROM auctions WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-house-1')),
  (SELECT id FROM users WHERE email = 'seed.bidder@granderealtors.dev'),
  23000000,
  NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (
  SELECT 1 FROM bids
  WHERE auction_id = (SELECT id FROM auctions WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-house-1'))
    AND user_id = (SELECT id FROM users WHERE email = 'seed.bidder@granderealtors.dev')
    AND bid_amount = 23000000
);

INSERT INTO bids (auction_id, user_id, bid_amount, bid_time)
SELECT
  (SELECT id FROM auctions WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-house-2')),
  (SELECT id FROM users WHERE email = 'seed.bidder@granderealtors.dev'),
  15500000,
  NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (
  SELECT 1 FROM bids
  WHERE auction_id = (SELECT id FROM auctions WHERE property_id = (SELECT id FROM properties WHERE public_id = 'seed-house-2'))
    AND user_id = (SELECT id FROM users WHERE email = 'seed.bidder@granderealtors.dev')
    AND bid_amount = 15500000
);
