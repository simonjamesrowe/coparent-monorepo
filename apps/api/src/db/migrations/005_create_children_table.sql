-- Migration: Create children table
-- Description: Children in family for pre-filled information during setup and invitations
-- Effort: 3 hours

CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_children_family_id ON children(family_id);
CREATE INDEX idx_children_family_name ON children(family_id, name);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_children_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER children_updated_at_trigger
BEFORE UPDATE ON children
FOR EACH ROW
EXECUTE FUNCTION update_children_updated_at();
