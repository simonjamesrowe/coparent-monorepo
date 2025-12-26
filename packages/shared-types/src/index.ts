/**
 * Shared TypeScript types for CoParent application
 * Used across both API and UI to ensure type consistency
 */

// User types
export interface User {
  id: string;
  auth0Id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Family types
export interface Family {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Parent types
export enum ParentRole {
  ADMIN_PARENT = 'ADMIN_PARENT',
  CO_PARENT = 'CO_PARENT'
}

export interface Parent {
  id: string;
  userId: string;
  familyId: string;
  role: ParentRole;
  joinedAt: Date;
}

// Invitation types
export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED'
}

export interface Invitation {
  id: string;
  familyId: string;
  inviterUserId: string;
  inviteeEmail: string;
  token: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
}

// Child types
export interface Child {
  id: string;
  familyId: string;
  name: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Expense types
export enum ExpensePrivacy {
  PRIVATE = 'PRIVATE',
  AMOUNT_ONLY = 'AMOUNT_ONLY',
  FULL_SHARED = 'FULL_SHARED'
}

export interface Expense {
  id: string;
  familyId: string;
  childId?: string;
  parentId: string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: Date;
  privacy: ExpensePrivacy;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccess<T = unknown> {
  data: T;
  message?: string;
}
