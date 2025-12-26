/**
 * Core domain types matching backend schema
 * See: spec.md "Data Model" section
 */

export interface User {
  id: string
  auth0_id: string
  email: string
  name: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Family {
  id: string
  name: string
  created_by_user_id: string
  created_at: string
  updated_at: string
}

export interface Parent {
  id: string
  user_id: string
  family_id: string
  role: 'ADMIN_PARENT' | 'CO_PARENT'
  joined_at?: string
  invited_at?: string
  invited_by_user_id?: string
  created_at: string
  updated_at: string
}

export interface Child {
  id: string
  family_id: string
  name: string
  date_of_birth: string
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  family_id: string
  inviting_parent_id: string
  email: string
  token: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
  expires_at: string
  accepted_at?: string
  accepted_by_user_id?: string
  resent_at?: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  family_id: string
  created_by_user_id: string
  amount: number
  category: string
  date: string
  description?: string
  receipt_url?: string
  privacy_mode: 'PRIVATE' | 'AMOUNT_ONLY' | 'FULL_SHARED'
  created_at: string
  updated_at: string
}

/**
 * API Response types
 */

export interface RegisterResponse {
  user: User
  family: Family | null
  needs_family_setup: boolean
  role?: 'ADMIN_PARENT' | 'CO_PARENT'
}

export interface MeResponse {
  user: User
  family: Family | null
  role?: 'ADMIN_PARENT' | 'CO_PARENT'
  joined_at?: string
}

export interface FamilyCreateRequest {
  name: string
  children: Array<{
    name: string
    date_of_birth: string
  }>
}

export interface FamilyCreateResponse {
  family: Family
  children: Child[]
  parent: Parent
}

export interface InvitationCreateRequest {
  email: string
  message?: string
}

export interface InvitationCreateResponse {
  invitation: Invitation
  invitation_url: string
}

export interface InvitationPreviewResponse {
  invitation: Invitation
  family: Family
  children: Child[]
  inviting_parent: {
    id: string
    name: string
    avatar_url?: string
  }
}

export interface InvitationAcceptRequest {
  token: string
}

export interface InvitationAcceptResponse {
  invitation: Invitation
  family: Family
  parent: Parent
}

export interface TransferAdminRequest {
  target_user_id: string
}

export interface TransferAdminResponse {
  family: Family
  previous_admin: Parent
  new_admin: Parent
  transfer_timestamp: string
}

/**
 * API Error response
 */
export interface ApiError {
  error: string
  message: string
  details?: Record<string, unknown>
}
