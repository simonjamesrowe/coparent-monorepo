# Milestone 3: Messaging & Permissions

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the Messaging & Permissions feature — Professional parent-to-parent communication with threading, plus formal permission request workflows for approvals and decisions..

## Overview

Professional parent-to-parent communication platform combining threaded messaging with formal permission request workflows. Parents can send messages, create permission requests for decisions requiring approval, and track the status of all communications in a unified interface.

**Key Functionality:**
- Send and receive messages in chat-style conversations with threading
- Mark messages as read/unread to track communication status
- Create permission requests for medical decisions, travel plans, schedule changes, or extracurricular activities
- Submit permission request → Awaiting response → Approve/Deny with status tracking
- Filter between messages and permission requests in combined view

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/messaging-and-permissions/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

The test instructions are framework-agnostic — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/messaging-and-permissions/components/`:

- `MessagingAndPermissions`

### Data Layer

The components expect these data shapes:

Parent, Message, PermissionRequest, Conversation

You'll need to:
- Create API endpoints or data fetching logic
- Connect real data to the components

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

Implement empty state UI for when no records exist yet:

- **No data yet:** Show a helpful message and call-to-action when the primary list/collection is empty
- **No related records:** Handle cases where associated records don't exist (e.g., a project with no tasks)
- **First-time user experience:** Guide users to create their first item with clear CTAs

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/messaging-and-permissions/README.md` — Feature overview and design intent
- `product-plan/sections/messaging-and-permissions/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/messaging-and-permissions/components/` — React components
- `product-plan/sections/messaging-and-permissions/types.ts` — TypeScript interfaces
- `product-plan/sections/messaging-and-permissions/sample-data.json` — Test data
- `product-plan/sections/messaging-and-permissions/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Send a Message

1. User selects a conversation in **Threads**
2. User types in the message box
3. User clicks **“Send”**
4. **Outcome:** Message appears in the thread

### Flow 2: Approve a Permission Request

1. User selects a permission conversation
2. User adds a response in **“Your response”**
3. User clicks **“Approve request”**
4. **Outcome:** Status badge updates and response is shown

### Flow 3: Filter Conversations

1. User selects **Messages** or **Permissions** filter
2. **Outcome:** Conversation list updates to match the filter


## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no records exist
- [ ] All user actions work
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile
