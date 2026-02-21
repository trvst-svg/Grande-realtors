ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS listing_purpose VARCHAR(50) DEFAULT 'sale',
  ADD COLUMN IF NOT EXISTS listing_type VARCHAR(50);

UPDATE properties
SET listing_purpose = COALESCE(listing_purpose, 'sale')
WHERE listing_purpose IS NULL;
