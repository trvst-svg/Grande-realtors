ALTER TABLE users
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS approval_reason TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITHOUT TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITHOUT TIME ZONE,
  ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id);

UPDATE users
SET approval_status = COALESCE(approval_status, 'approved')
WHERE approval_status IS NULL;
