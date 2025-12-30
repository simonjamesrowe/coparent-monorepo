// =============================================================================
// Data Types
// =============================================================================

export type ParentRole = 'primary' | 'co-parent'
export type ParentStatus = 'active'
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'canceled'
export type OnboardingStep = 'account' | 'family' | 'child' | 'invite' | 'review' | 'complete'

export interface Family {
  id: string
  name: string
  timeZone: string
  parentIds: string[]
  childIds: string[]
  invitationIds: string[]
  createdAt: string
}

export interface Parent {
  id: string
  familyId: string
  fullName: string
  email: string
  role: ParentRole
  status: ParentStatus
  lastSignedInAt: string
}

export interface Child {
  id: string
  familyId: string
  fullName: string
  dateOfBirth: string
  school?: string
  medicalNotes?: string
}

export interface Invitation {
  id: string
  familyId: string
  email: string
  role: ParentRole
  status: InvitationStatus
  sentAt: string
  expiresAt: string
  acceptedAt?: string
  canceledAt?: string
}

export interface OnboardingState {
  id: string
  familyId: string
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  isComplete: boolean
  lastUpdated: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface UserSignupAndFamilyManagementProps {
  /** Families available to the current user */
  families: Family[]
  /** Parents tied to the selected family */
  parents: Parent[]
  /** Child profiles for the selected family */
  children: Child[]
  /** Invitations tied to the selected family */
  invitations: Invitation[]
  /** Onboarding progress for each family */
  onboardingStates: OnboardingState[]
  /** Active family selection for the hub or wizard */
  activeFamilyId?: string
  /** Which view to render in the section */
  mode?: 'wizard' | 'hub'
  /** Called when user begins account creation */
  onCreateAccount?: () => void
  /** Called when user creates a family during onboarding */
  onCreateFamily?: (name: string, timeZone: string) => void
  /** Called when user edits family details */
  onUpdateFamily?: (id: string, updates: Partial<Family>) => void
  /** Called when user adds a child profile */
  onAddChild?: (child: Child) => void
  /** Called when user edits a child profile */
  onUpdateChild?: (id: string, updates: Partial<Child>) => void
  /** Called when user sends an invitation to a co-parent */
  onInviteCoParent?: (familyId: string, email: string, role: ParentRole) => void
  /** Called when user resends an invitation */
  onResendInvite?: (invitationId: string) => void
  /** Called when user cancels an invitation */
  onCancelInvite?: (invitationId: string) => void
  /** Called when user assigns or changes a parent role */
  onAssignRole?: (parentId: string, role: ParentRole) => void
  /** Called when onboarding is completed */
  onCompleteOnboarding?: (familyId: string) => void
  /** Called when user switches the active family */
  onSelectFamily?: (familyId: string) => void
}
