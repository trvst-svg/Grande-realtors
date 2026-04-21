ALTER TABLE contracts
  ALTER COLUMN bid_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS contracts_transaction_id_idx
  ON contracts(transaction_id)
  WHERE transaction_id IS NOT NULL;
