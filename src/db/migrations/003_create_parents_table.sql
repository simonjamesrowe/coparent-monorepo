-- Migration: Create parents table
-- Description: Join table linking User and Family with role-based access control
-- Effort: 5 hours

-- Create ENUM type for role
CREATE TYPE parent_role AS ENUM ('ADMIN_PARENT', 'CO_PARENT');

CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  role parent_role NOT NULL,
  joined_at TIMESTAMP,
  invited_at TIMESTAMP,
  invited_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  -- One user per family (MVP constraint)
  UNIQUE(user_id, family_id)
);

-- Indexes for performance and queries
CREATE INDEX idx_parents_family_id ON parents(family_id);
CREATE INDEX idx_parents_user_id ON parents(user_id);
CREATE INDEX idx_parents_family_role ON parents(family_id, role);
CREATE INDEX idx_parents_family_user ON parents(family_id, user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_parents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parents_updated_at_trigger
BEFORE UPDATE ON parents
FOR EACH ROW
EXECUTE FUNCTION update_parents_updated_at();
