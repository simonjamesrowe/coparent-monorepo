# Test Instructions: Messaging & Permissions

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

Validate the unified communications workspace that blends chat-style messaging with permission approvals. Key UI labels include **“New message”**, **“New permission”**, **“All / Messages / Permissions”**, **“Send”**, and **“Approve request.”**

---

## User Flow Tests

### Flow 1: Send a Message

**Scenario:** User sends a new message in an existing conversation.

#### Success Path

**Setup:**
- Conversations list includes at least one `type: "message"` thread.

**Steps:**
1. Select a conversation in **Threads**.
2. Enter text into the message box (placeholder: “Write a message or follow up on a decision...” ).
3. Click **“Send.”**

**Expected Results:**
- [ ] `onSendMessage` called with conversation id and message text.
- [ ] Draft message clears after send.
- [ ] Message appears in the thread with timestamp.

#### Failure Path: Empty Message

**Setup:**
- Leave draft empty.

**Steps:**
1. Click **“Send.”**

**Expected Results:**
- [ ] Message is not sent.
- [ ] No new message is appended.

### Flow 2: Approve a Permission Request

**Scenario:** User approves a pending permission request.

**Steps:**
1. Select a conversation labeled **“Permission.”**
2. Enter response text in **“Your response”** textarea (placeholder: “Share any notes or conditions...” ).
3. Click **“Approve request.”**

**Expected Results:**
- [ ] `onApprovePermission` called with permission id and response.
- [ ] Status badge updates to approved.
- [ ] “Resolved …” text appears if `resolvedAt` is set.

### Flow 3: Filter Conversations

**Scenario:** User filters between all, messages only, and permission requests.

**Steps:**
1. Click filter **“Messages.”**
2. Click filter **“Permissions.”**

**Expected Results:**
- [ ] Conversation list updates to match filter.
- [ ] “No conversations found” appears if filter yields zero results.

---

## Empty State Tests

### Empty Conversations

**Scenario:** No conversations exist.

**Expected Results:**
- [ ] “No conversations found” message appears.
- [ ] Helper text suggests creating a new message thread.

### Permission Details Missing

**Scenario:** A permission conversation lacks permissionRequest data.

**Expected Results:**
- [ ] “Permission details unavailable.” is shown in the panel.

---

## Component Interaction Tests

- [ ] **“Mark read”** and **“Mark unread”** buttons call respective callbacks.
- [ ] Unread badge count displays when `unreadCount > 0`.
- [ ] Status badges show **pending/approved/denied** for permissions.

---

## Edge Cases

- [ ] Very long subjects truncate in the thread list.
- [ ] Mixed message + permission conversations render correct previews.
- [ ] Switching filters preserves selected conversation where possible.

---

## Accessibility Checks

- [ ] Filters and buttons are keyboard accessible.
- [ ] Textarea has visible placeholder and focus state.
- [ ] Status badges have sufficient color contrast in light/dark modes.

---

## Sample Test Data

```typescript
const messageConversation = {
  id: 'conv-004',
  type: 'message',
  subject: 'School Parent-Teacher Conference',
  messages: [
    { id: 'msg-001', senderId: 'parent-002', content: 'Hey, got the reminder...', timestamp: '2024-01-26T15:20:00Z', isRead: true }
  ],
  unreadCount: 0
}

const permissionConversation = {
  id: 'conv-001',
  type: 'permission',
  subject: 'Soccer Camp Registration',
  permissionRequest: {
    id: 'perm-001',
    type: 'extracurricular',
    childName: 'Emma Martinez',
    status: 'pending',
    description: 'Register for summer soccer camp...'
  }
}
```
