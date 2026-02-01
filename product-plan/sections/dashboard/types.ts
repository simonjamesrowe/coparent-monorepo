// =============================================================================
// Data Types
// =============================================================================

export type ParentRole = 'primary' | 'secondary'

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
}

export interface Parent {
  id: string
  fullName: string
  email: string
  role: ParentRole
  phone: string
  avatarUrl: string
  lastActiveAt: string
  notificationPreferences: NotificationPreferences
}

export interface Child {
  id: string
  firstName: string
  lastName: string
  birthdate: string
  grade: string
  school: string
  avatarUrl: string
  medicalNotes: string
  allergies: string[]
}

export interface Family {
  id: string
  name: string
  timezone: string
  primaryParentId: string
  secondaryParentId: string
  childIds: string[]
  createdAt: string
  setupProgress: number
}

export type EventType = 'custody' | 'activity' | 'appointment' | 'school' | 'holiday'
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled'

export interface Event {
  id: string
  title: string
  type: EventType
  startAt: string
  endAt: string
  location: string
  childId: string | null
  status: EventStatus
  notes: string
}

export type ExpenseStatus = 'pending' | 'approved' | 'reimbursed' | 'denied'

export interface Expense {
  id: string
  title: string
  category: string
  amount: number
  currency: string
  date: string
  status: ExpenseStatus
  paidByParentId: string
  childId: string | null
  receiptUrls: string[]
  description: string
}

export type PermissionRequestType =
  | 'schedule-change'
  | 'activity'
  | 'purchase'
  | 'travel'
  | 'medical'

export type PermissionRequestStatus = 'pending' | 'approved' | 'denied'

export interface PermissionRequest {
  id: string
  title: string
  type: PermissionRequestType
  status: PermissionRequestStatus
  requestedByParentId: string
  resolvedByParentId: string | null
  requestedAt: string
  resolvedAt: string | null
  summary: string
  relatedEntityType: 'event' | 'expense' | 'document'
  relatedEntityId: string
}

export interface Message {
  id: string
  threadId: string
  fromParentId: string
  toParentId: string
  subject: string
  preview: string
  sentAt: string
  unread: boolean
}

export type InvitationRole = 'co-parent' | 'caregiver'
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'canceled'

export interface Invitation {
  id: string
  email: string
  role: InvitationRole
  status: InvitationStatus
  sentAt: string
  lastSentAt: string
  expiresAt: string
  invitedByParentId: string
}

export type ActivityType =
  | 'event'
  | 'expense'
  | 'permission'
  | 'message'
  | 'document'
  | 'milestone'

export interface ActivityFeedItem {
  id: string
  type: ActivityType
  title: string
  timestamp: string
  summary: string
  actorParentId: string
  entityType: 'event' | 'expense' | 'permissionRequest' | 'message'
  entityId: string
}

export interface BudgetCategory {
  category: string
  limit: number
  spent: number
}

export interface BudgetSummary {
  month: string
  totalLimit: number
  totalSpent: number
  remaining: number
  categories: BudgetCategory[]
}

export interface ApprovalsSummary {
  totalPending: number
  byType: {
    expenses: number
    scheduleChanges: number
    permissions: number
  }
}

export interface SetupChecklistItem {
  id: string
  label: string
  completed: boolean
}

export interface SetupChecklist {
  completedCount: number
  totalCount: number
  items: SetupChecklistItem[]
}

export type WidgetSize = 'sm' | 'md' | 'lg'
export type WidgetTrend = 'up' | 'down' | 'flat'

export type DashboardSectionId =
  | 'dashboard'
  | 'calendar'
  | 'messaging'
  | 'expenses'
  | 'permissions'
  | 'repository'
  | 'timeline'
  | 'family'

export interface WidgetCard {
  id: string
  title: string
  value: string
  description: string
  trend: WidgetTrend
  delta: string
  size: WidgetSize
  sectionId: DashboardSectionId
}

export type QuickActionId = 'add-expense' | 'create-event' | 'send-message'

export interface QuickAction {
  id: QuickActionId
  label: string
  helper: string
  shortcut: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface ParentProfileUpdate {
  fullName: string
  email: string
  phone: string
  notificationPreferences: NotificationPreferences
}

export interface ProfileDrawerProps {
  parent: Parent
  family: Family
  isOpen: boolean
  onClose?: () => void
  /** Save profile updates for the parent */
  onSaveProfile?: (parentId: string, update: ParentProfileUpdate) => void
}

export interface ChildrenDrawerProps {
  children: Child[]
  isOpen: boolean
  onClose?: () => void
  /** Add a new child profile */
  onAddChild?: () => void
  /** Edit an existing child profile */
  onEditChild?: (childId: string) => void
}

export interface InvitationsDrawerProps {
  invitations: Invitation[]
  parents: Parent[]
  isOpen: boolean
  onClose?: () => void
  /** Resend an invitation */
  onResendInvitation?: (invitationId: string) => void
  /** Cancel an invitation */
  onCancelInvitation?: (invitationId: string) => void
}

export interface DashboardProps {
  family: Family
  parents: Parent[]
  children: Child[]
  events: Event[]
  upcomingEvents: Event[]
  expenses: Expense[]
  permissionRequests: PermissionRequest[]
  messages: Message[]
  invitations: Invitation[]
  activityFeed: ActivityFeedItem[]
  budgetSummary: BudgetSummary
  approvalsSummary: ApprovalsSummary
  setupChecklist: SetupChecklist
  widgetCards: WidgetCard[]
  quickActions: QuickAction[]
  /** Open the profile drawer */
  onOpenProfileDrawer?: () => void
  /** Open the children management drawer */
  onOpenChildrenDrawer?: () => void
  /** Open the invitations drawer */
  onOpenInvitationsDrawer?: () => void
  /** Trigger creating a new child */
  onAddChild?: () => void
  /** Trigger editing a child profile */
  onEditChild?: (childId: string) => void
  /** Resend an invitation */
  onResendInvitation?: (invitationId: string) => void
  /** Cancel an invitation */
  onCancelInvitation?: (invitationId: string) => void
  /** Navigate to a section from a widget */
  onNavigateSection?: (sectionId: DashboardSectionId) => void
  /** View a permission request */
  onViewApproval?: (requestId: string) => void
  /** View an event detail */
  onViewEvent?: (eventId: string) => void
  /** View an expense detail */
  onViewExpense?: (expenseId: string) => void
  /** Open a message thread */
  onOpenMessageThread?: (threadId: string) => void
  /** Trigger quick add expense */
  onQuickAddExpense?: () => void
  /** Trigger quick create event */
  onQuickCreateEvent?: () => void
  /** Trigger quick send message */
  onQuickSendMessage?: () => void
}
