-- Migration: Create expenses table
-- Description: Family expenses with granular privacy controls (partition key: family_id)
-- Effort: 5 hours

-- Create ENUM type for privacy mode
CREATE TYPE expense_privacy_mode AS ENUM ('PRIVATE', 'AMOUNT_ONLY', 'FULL_SHARED');

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  privacy_mode expense_privacy_mode NOT NULL DEFAULT 'FULL_SHARED',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance - family_id is partition key
CREATE INDEX idx_expenses_family_id ON expenses(family_id);
CREATE INDEX idx_expenses_created_by ON expenses(created_by_user_id);
CREATE INDEX idx_expenses_family_date ON expenses(family_id, date);
CREATE INDEX idx_expenses_family_created_by ON expenses(family_id, created_by_user_id);
CREATE INDEX idx_expenses_privacy_mode ON expenses(privacy_mode);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expenses_updated_at_trigger
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_expenses_updated_at();
