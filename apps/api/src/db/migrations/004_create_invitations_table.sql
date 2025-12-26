-- Migration: Create invitations table
-- Description: Email-based parent invitations with 7-day expiring tokens
-- Effort: 5 hours

-- Create ENUM type for invitation status
CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  inviting_parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  status invitation_status NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  accepted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  resent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_family_email ON invitations(family_id, email);
CREATE INDEX idx_invitations_family_status ON invitations(family_id, status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invitations_updated_at_trigger
BEFORE UPDATE ON invitations
FOR EACH ROW
EXECUTE FUNCTION update_invitations_updated_at();
