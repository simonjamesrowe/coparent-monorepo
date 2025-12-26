/**
 * TypeScript type definitions for database entities
 */

export interface User {
  id: string;
  auth0_id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface Family {
  id: string;
  name: string;
  created_by_user_id: string;
  created_at: Date;
  updated_at: Date;
}

export type ParentRole = 'ADMIN_PARENT' | 'CO_PARENT';

export interface Parent {
  id: string;
  user_id: string;
  family_id: string;
  role: ParentRole;
  joined_at?: Date | null;
  invited_at?: Date | null;
  invited_by_user_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Invitation {
  id: string;
  family_id: string;
  inviting_parent_id: string;
  email: string;
  token: string;
  status: InvitationStatus;
  expires_at: Date;
  accepted_at?: Date | null;
  accepted_by_user_id?: string | null;
  resent_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Child {
  id: string;
  family_id: string;
  name: string;
  date_of_birth: Date | string;
  created_at: Date;
  updated_at: Date;
}

export type ExpensePrivacyMode = 'PRIVATE' | 'AMOUNT_ONLY' | 'FULL_SHARED';

export interface Expense {
  id: string;
  family_id: string;
  created_by_user_id: string;
  amount: number;
  category: string;
  date: Date | string;
  description?: string | null;
  receipt_url?: string | null;
  privacy_mode: ExpensePrivacyMode;
  created_at: Date;
  updated_at: Date;
}

/**
 * JWT Claims extracted from Auth0 token
 */
export interface JWTClaims {
  sub: string; // Auth0 user ID
  aud?: string;
  iss?: string;
  iat: number;
  exp: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  [key: string]: any;
}

/**
 * User context attached to Express request
 */
export interface UserContext {
  auth0_id: string;
  email?: string;
  name?: string;
  roles?: string[];
  [key: string]: any;
}

/**
 * Family context for route parameters/body
 */
export interface FamilyContext {
  family_id: string;
  user_id: string;
  parent_id: string;
}
