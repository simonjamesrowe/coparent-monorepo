// =============================================================================
// CoParent Data Model Types
// Note: This product uses MongoDB (document database)
// =============================================================================

// -----------------------------------------------------------------------------
// Shared Types
// -----------------------------------------------------------------------------

export type ParentRole = 'primary' | 'co-parent'
export type ParentStatus = 'active' | 'inactive'
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'canceled'
export type RequestStatus = 'pending' | 'approved' | 'declined'
export type EventType = 'custody' | 'activity' | 'medical' | 'school' | 'holiday'
export type MilestoneType = 'achievement' | 'behavior' | 'health' | 'photo'
export type DocumentType = 'medical' | 'school' | 'vaccination' | 'emergency' | 'other'
export type ChangeType = 'swap' | 'extend' | 'add' | 'remove'

// -----------------------------------------------------------------------------
// Core Entities
// -----------------------------------------------------------------------------

export interface Family {
  id: string
  name: string
  timeZone: string
  parentIds: string[]
  childIds: string[]
  invitationIds: string[]
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface Parent {
  id: string
  familyId: string
  fullName: string
  email: string
  role: ParentRole
  status: ParentStatus
  color: string
  avatarUrl: string | null
  lastSignedInAt: string
  createdAt: string
  updatedAt?: string
}

export interface Child {
  id: string
  familyId: string
  fullName: string
  dateOfBirth: string
  school?: string
  medicalNotes?: string
  avatarUrl: string | null
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface Event {
  id: string
  familyId: string
  type: EventType
  title: string
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
  allDay: boolean
  parentId: string | null
  childIds: string[]
  categoryId: string
  location?: string
  notes: string | null
  recurring: RecurringPattern | null
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  days?: string[]
}

export interface EventCategory {
  id: string
  familyId?: string
  name: string
  icon: string
  color?: string
  isDefault: boolean
  isSystem: boolean
  createdAt: string
}

export interface Expense {
  id: string
  familyId: string
  childIds: string[]
  amount: number
  category: string
  description: string
  date: string
  receiptUrl: string | null
  paidBy: string
  splitWith: string[]
  reimbursementStatus: RequestStatus
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface Milestone {
  id: string
  familyId: string
  childId: string
  type: MilestoneType
  title: string
  description: string
  date: string
  createdBy: string
  createdAt: string
  attachments: string[]
}
