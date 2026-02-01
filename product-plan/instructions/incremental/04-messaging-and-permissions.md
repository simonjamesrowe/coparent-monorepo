# Milestone 4: Messaging & Permissions

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the Messaging & Permissions feature — Professional parent-to-parent communication with threading, plus formal permission request workflows for approvals and decisions.

## Overview

Professional parent-to-parent communication platform combining threaded messaging with formal permission request workflows. Parents can send messages, create permission requests for decisions requiring approval, and track the status of all communications in a unified interface.

**Key Functionality:**

- Send and receive messages in chat-style conversations with threading
- Mark messages as read/unread to track communication status
- Create permission requests for medical decisions, travel plans, schedule changes, or extracurricular activities
- Submit permission request → Awaiting response → Approve/Deny with status tracking
- Filter between messages and permission requests in combined view
- View conversation history and permission request outcomes

## Recommended Approach: Test-Driven Development

See `product-plan/sections/messaging-and-permissions/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/messaging-and-permissions/components/`:

- `MessagingAndPermissions`

### Data Layer

The components expect these data shapes:

- Parent, Message, PermissionRequest, Conversation

### Callbacks

Wire up these user actions:

- `onViewConversation` — Called when user wants to view a conversation's details
- `onSendMessage` — Called when user wants to send a new message in a conversation
- `onMarkAsRead` — Called when user wants to mark a conversation as read
- `onMarkAsUnread` — Called when user wants to mark a conversation as unread
- `onCreateMessage` — Called when user wants to create a new message conversation
- `onCreatePermissionRequest` — Called when user wants to create a new permission request
- `onApprovePermission` — Called when user approves a permission request
- `onDenyPermission` — Called when user denies a permission request

### Empty States

Implement empty state UI for when no records exist yet.

## Files to Reference

- `product-plan/sections/messaging-and-permissions/README.md` — Feature overview and design intent
- `product-plan/sections/messaging-and-permissions/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/messaging-and-permissions/components/` — React components
- `product-plan/sections/messaging-and-permissions/types.ts` — TypeScript interfaces
- `product-plan/sections/messaging-and-permissions/sample-data.json` — Test data
- `product-plan/sections/messaging-and-permissions/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Send and receive messages in chat-style conversations with threading

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 2: Mark messages as read/unread to track communication status

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 3: Create permission requests for medical decisions, travel plans, schedule changes, or extracurricular activities

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no records exist
- [ ] All user actions work
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile
