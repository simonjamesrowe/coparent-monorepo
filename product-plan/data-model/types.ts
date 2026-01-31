// Generated from product data model

export interface Family {
  id: string
  parentIds: string[]
  childIds: string[]
}

export interface Parent {
  id: string
  familyId: string
}

export interface Child {
  id: string
  familyId: string
}

export interface Event {
  id: string
  familyId: string
  childId?: string
}

export interface Message {
  id: string
  familyId: string
  senderParentId: string
}

export interface PermissionRequest {
  id: string
  familyId: string
  status: 'pending' | 'approved' | 'denied'
  requestedByParentId: string
  resolvedByParentId?: string
}

export interface Expense {
  id: string
  familyId: string
  childId?: string
}

export interface Document {
  id: string
  familyId: string
  childId?: string
}

export interface Milestone {
  id: string
  childId: string
}

export interface AuditEntry {
  id: string
  entityType: string
  entityId: string
  action: 'create' | 'update' | 'delete'
  timestamp: string
  actorParentId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}
