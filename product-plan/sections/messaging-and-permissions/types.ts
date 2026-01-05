// =============================================================================
// Data Types
// =============================================================================

export interface Parent {
  id: string
  name: string
  avatarUrl: string | null
}

export interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface PermissionRequest {
  id: string
  type: 'medical' | 'travel' | 'schedule' | 'extracurricular'
  childId: string
  childName: string
  description: string
  requestedBy: string
  status: 'pending' | 'approved' | 'denied'
  createdAt: string
  resolvedAt: string | null
  response: string | null
}

export interface Conversation {
  id: string
  type: 'message' | 'permission'
  subject: string
  lastMessageAt: string
  unreadCount: number
  participants: {
    parent1: Parent
    parent2: Parent
  }
  messages?: Message[]
  permissionRequest?: PermissionRequest
}

// =============================================================================
// Component Props
// =============================================================================

export interface MessagingAndPermissionsProps {
  /** The list of conversations to display (messages and permission requests) */
  conversations: Conversation[]
  /** The ID of the current user viewing the interface */
  currentUserId: string
  /** Called when user wants to view a conversation's details */
  onViewConversation?: (id: string) => void
  /** Called when user wants to send a new message in a conversation */
  onSendMessage?: (conversationId: string, content: string) => void
  /** Called when user wants to mark a conversation as read */
  onMarkAsRead?: (id: string) => void
  /** Called when user wants to mark a conversation as unread */
  onMarkAsUnread?: (id: string) => void
  /** Called when user wants to create a new message conversation */
  onCreateMessage?: () => void
  /** Called when user wants to create a new permission request */
  onCreatePermissionRequest?: () => void
  /** Called when user approves a permission request */
  onApprovePermission?: (permissionId: string, response?: string) => void
  /** Called when user denies a permission request */
  onDenyPermission?: (permissionId: string, response?: string) => void
}
