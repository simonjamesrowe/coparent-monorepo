// =============================================================================
// Data Types
// =============================================================================

export interface Parent {
  id: string
  name: string
  fullName: string
  email: string
  color: string
  avatarUrl: string | null
}

export interface Child {
  id: string
  name: string
  fullName: string
  birthdate: string
  avatarUrl: string | null
}

export interface EventCategory {
  id: string
  name: string
  icon: string
  color?: string
  isDefault: boolean
  isSystem: boolean
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  days?: string[]
}

export interface Event {
  id: string
  type: 'custody' | 'activity' | 'medical' | 'school' | 'holiday'
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
}

export interface ProposedChange {
  type: 'swap' | 'extend' | 'add' | 'remove'
  originalStartDate?: string
  originalEndDate?: string
  newStartDate: string
  newEndDate: string
}

export interface ScheduleChangeRequest {
  id: string
  status: 'pending' | 'approved' | 'declined'
  requestedBy: string
  requestedAt: string
  resolvedBy: string | null
  resolvedAt: string | null
  originalEventId: string | null
  proposedChange: ProposedChange
  reason: string
  responseNote: string | null
}

// =============================================================================
// Component Props
// =============================================================================

export interface CalendarSchedulingProps {
  /** The two co-parents */
  parents: Parent[]
  /** The children being co-parented */
  children: Child[]
  /** All calendar events */
  events: Event[]
  /** Available event categories */
  eventCategories: EventCategory[]
  /** Pending, approved, and declined schedule change requests */
  scheduleChangeRequests: ScheduleChangeRequest[]
  /** The currently logged-in parent's ID */
  currentParentId: string

  // Event actions
  /** Called when user wants to view event details */
  onViewEvent?: (eventId: string) => void
  /** Called when user wants to create a new event */
  onCreateEvent?: () => void
  /** Called when user wants to edit an event */
  onEditEvent?: (eventId: string) => void
  /** Called when user wants to delete an event */
  onDeleteEvent?: (eventId: string) => void

  // Schedule change request actions
  /** Called when user wants to request a schedule change */
  onRequestScheduleChange?: (eventId: string) => void
  /** Called when user approves a schedule change request */
  onApproveRequest?: (requestId: string, responseNote?: string) => void
  /** Called when user declines a schedule change request */
  onDeclineRequest?: (requestId: string, responseNote?: string) => void
  /** Called when user wants to view request details */
  onViewRequest?: (requestId: string) => void

  // Category actions
  /** Called when user wants to create a custom category */
  onCreateCategory?: () => void
  /** Called when user wants to edit a category */
  onEditCategory?: (categoryId: string) => void
  /** Called when user wants to delete a category */
  onDeleteCategory?: (categoryId: string) => void

  // View actions
  /** Called when user changes the calendar view */
  onChangeView?: (view: 'month' | 'week' | 'day') => void
  /** Called when user navigates to a different date */
  onNavigateDate?: (date: string) => void
}
