ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS listing_purpose VARCHAR(50) DEFAULT 'sale',
  ADD COLUMN IF NOT EXISTS listing_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS sale_status VARCHAR(50) DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

UPDATE properties
SET listing_purpose = COALESCE(listing_purpose, 'sale')
WHERE listing_purpose IS NULL;

UPDATE properties
SET sale_status = COALESCE(sale_status, 'available')
WHERE sale_status IS NULL;
