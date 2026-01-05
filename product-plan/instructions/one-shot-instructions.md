# CoParent — Complete Implementation Instructions

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Test-Driven Development

Each section includes a `tests.md` file with detailed test-writing instructions. These are **framework-agnostic** — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write failing tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

The test instructions include:
- Specific UI elements, button labels, and interactions to verify
- Expected success and failure behaviors
- Empty state handling (when no records exist yet)
- Data assertions and state validations

---

# CoParent — Product Overview

## Summary

CoParent is a unified digital platform that helps separated and divorced parents coordinate parenting responsibilities, manage shared expenses, and maintain clear communication—reducing conflict, building trust, and creating a legally sound record of their co-parenting relationship.

## Planned Sections

1. **Calendar & Scheduling** — Shared calendar for custody schedules, activities, appointments, and important dates with real-time sync between parents.
1. **Messaging & Permissions** — Professional parent-to-parent communication with threading, plus formal permission request workflows for approvals and decisions.
1. **Expenses & Finances** — Expense tracking with receipt uploads, reimbursement requests, approval workflows, and spending analytics.
1. **Information Repository** — Centralized storage for medical records, school documents, emergency contacts, and critical family information.
1. **Timeline & Photos** — Chronological evidence timeline documenting milestones and achievements, plus private family photo albums.
1. **User Signup & Family Management** — Account creation, child profile setup, family roles, and invite flow to bring a non-registered co-parent into the platform.

## Data Model

Family, Parent, Child, Event, Message, PermissionRequest, Expense, Document, Milestone, AuditEntry

## Design System

**Colors:**
- Primary: teal
- Secondary: rose
- Neutral: slate

**Typography:**
- Heading: Inter
- Body: Inter
- Mono: IBM Plex Mono

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, and application shell
2. **Calendar & Scheduling** — Shared calendar for custody schedules, activities, appointments, and important dates with real-time sync between parents.
3. **Messaging & Permissions** — Professional parent-to-parent communication with threading, plus formal permission request workflows for approvals and decisions.
4. **User Signup & Family Management** — Account creation, child profile setup, family roles, and invite flow to bring a non-registered co-parent into the platform.

Each milestone has a dedicated instruction document in `product-plan/instructions/`.

---

# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---


## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for interface definitions
- See `product-plan/data-model/README.md` for entity relationships

### 3. Routing Structure

Create placeholder routes for each section:

- /calendar-scheduling — Calendar & Scheduling
- /messaging-permissions — Messaging & Permissions
- /expenses-finances — Expenses & Finances
- /information-repository — Information Repository
- /timeline-photos — Timeline & Photos
- /user-signup-family-management — User Signup & Family Management

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu with avatar

**Wire Up Navigation:**

Connect navigation to your routing:

- Dashboard
- Calendar
- Messages
- Expenses
- Documents
- Timeline
- Settings
- Desktop (1024px+):
- Tablet (768px-1023px):
- Mobile (<768px):

**User Menu:**

The user menu expects:
- User name
- Avatar URL (optional)
- Logout callback

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components
- `product-plan/shell/screenshot.png` — Shell visual reference

## Done When

- [ ] Design tokens are configured
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with navigation
- [ ] Navigation links to correct routes
- [ ] User menu shows user info
- [ ] Responsive on mobile

---

# Milestone 2: Calendar & Scheduling

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the Calendar & Scheduling feature — Shared calendar for custody schedules, activities, appointments, and important dates with real-time sync between parents..

## Overview

A shared calendar system that enables co-parents to manage custody schedules, activities, appointments, and important dates. Parents can view time in monthly, weekly, or daily views with color-coding to clearly distinguish which parent has custody. Schedule changes require approval from the other parent.

**Key Functionality:**
- View calendar in monthly, weekly, or daily view with parent-colored custody blocks
- Create and edit custody schedules with custom day-by-day configuration
- Add events (activities, medical appointments, school events, holidays, custom categories)
- Request schedule changes (swap days, adjust times) which require other parent's approval
- Approve or decline incoming schedule change requests

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/calendar-and-scheduling/tests.md` for detailed test-writing instructions including:
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

Copy the section components from `product-plan/sections/calendar-and-scheduling/components/`:

- `CalendarHeader`
- `CalendarView`
- `CategoryManagement`
- `DayView`
- `EventCreationForm`
- `EventPill`
- `MonthView`
- `PendingRequestsBadge`
- `ScheduleChangeApproval`
- `ScheduleChangeRequestModal`
- `WeekView`

### Data Layer

The components expect these data shapes:

Parent, Child, EventCategory, RecurringPattern, Event, ProposedChange, ScheduleChangeRequest

You'll need to:
- Create API endpoints or data fetching logic
- Connect real data to the components

### Callbacks

Wire up these user actions:

- `onViewEvent` — Called when user wants to view event details
- `onCreateEvent` — Called when user wants to create a new event
- `onEditEvent` — Called when user wants to edit an event
- `onDeleteEvent` — Called when user wants to delete an event
- `onRequestScheduleChange` — Called when user wants to request a schedule change
- `onApproveRequest` — Called when user approves a schedule change request
- `onDeclineRequest` — Called when user declines a schedule change request
- `onViewRequest` — Called when user wants to view request details
- `onCreateCategory` — Called when user wants to create a custom category
- `onEditCategory` — Called when user wants to edit a category
- `onDeleteCategory` — Called when user wants to delete a category
- `onChangeView` — Called when user changes the calendar view
- `onNavigateDate` — Called when user navigates to a different date

### Empty States

Implement empty state UI for when no records exist yet:

- **No data yet:** Show a helpful message and call-to-action when the primary list/collection is empty
- **No related records:** Handle cases where associated records don't exist (e.g., a project with no tasks)
- **First-time user experience:** Guide users to create their first item with clear CTAs

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/calendar-and-scheduling/README.md` — Feature overview and design intent
- `product-plan/sections/calendar-and-scheduling/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/calendar-and-scheduling/components/` — React components
- `product-plan/sections/calendar-and-scheduling/types.ts` — TypeScript interfaces
- `product-plan/sections/calendar-and-scheduling/sample-data.json` — Test data
- `product-plan/sections/calendar-and-scheduling/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Create a New Event

1. User clicks **“Add Event”**
2. User fills **Title**, selects **Event type**, and chooses **Category**
3. User clicks **“Save Event”**
4. **Outcome:** New event appears in the calendar view

### Flow 2: Request a Schedule Change

1. User opens **“Request Schedule Change”** on a custody event
2. User chooses **“Swap Days”** or **“Adjust Time”**
3. User enters a **Reason for Request** and clicks **“Send Request”**
4. **Outcome:** Request appears as **pending**

### Flow 3: Approve/Decline a Request

1. User selects a pending request in **Schedule Change Approvals**
2. User enters **Response note (optional)**
3. User clicks **“Approve change”** or **“Decline”**
4. **Outcome:** Request status updates and response is saved


## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no records exist
- [ ] All user actions work
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

---

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

---

# Milestone 4: User Signup & Family Management

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the User Signup & Family Management feature — Account creation, child profile setup, family roles, and invite flow to bring a non-registered co-parent into the platform..

## Overview

This section covers initial account creation and family setup, guiding a parent through creating a family, adding a child profile, and inviting a co-parent. After onboarding, a family setup hub summarizes key entities and invitation status so users can complete or revise setup details.

**Key Functionality:**
- Complete onboarding wizard: create account → create family → add child profile → invite co-parent → review & finish.
- View family setup hub with cards for Family, Children, Invitations, and Roles.
- Manage invites: send, resend, or cancel a co-parent invitation and see status badges.
- Add or edit child profile details from the setup hub.
- Assign roles (Primary Parent, Co-parent) during invite or setup.

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/user-signup-and-family-management/tests.md` for detailed test-writing instructions including:
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

Copy the section components from `product-plan/sections/user-signup-and-family-management/components/`:

- `FamilySetupHub`
- `OnboardingWizard`

### Data Layer

The components expect these data shapes:

ParentRole, ParentStatus, InvitationStatus, OnboardingStep, Family, Parent, Child, Invitation, OnboardingState

You'll need to:
- Create API endpoints or data fetching logic
- Connect real data to the components

### Callbacks

Wire up these user actions:

- `onCreateAccount` — Called when user begins account creation
- `onCreateFamily` — Called when user creates a family during onboarding
- `onUpdateFamily` — Called when user edits family details
- `onAddChild` — Called when user adds a child profile
- `onUpdateChild` — Called when user edits a child profile
- `onInviteCoParent` — Called when user sends an invitation to a co-parent
- `onResendInvite` — Called when user resends an invitation
- `onCancelInvite` — Called when user cancels an invitation
- `onAssignRole` — Called when user assigns or changes a parent role
- `onCompleteOnboarding` — Called when onboarding is completed
- `onSelectFamily` — Called when user switches the active family

### Empty States

Implement empty state UI for when no records exist yet:

- **No data yet:** Show a helpful message and call-to-action when the primary list/collection is empty
- **No related records:** Handle cases where associated records don't exist (e.g., a project with no tasks)
- **First-time user experience:** Guide users to create their first item with clear CTAs

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/user-signup-and-family-management/README.md` — Feature overview and design intent
- `product-plan/sections/user-signup-and-family-management/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/user-signup-and-family-management/components/` — React components
- `product-plan/sections/user-signup-and-family-management/types.ts` — TypeScript interfaces
- `product-plan/sections/user-signup-and-family-management/sample-data.json` — Test data
- `product-plan/sections/user-signup-and-family-management/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Complete Onboarding Wizard

1. User fills **Full Name**, **Email Address**, **Password**
2. User clicks **“Create Account”**, then **“Continue”**
3. User adds a child and clicks **“Add Child”** then **“Continue”**
4. User sends invite or chooses **“Skip for now”**
5. User clicks **“Complete Setup”**
6. **Outcome:** Onboarding completes

### Flow 2: Manage Invitations

1. User visits **Co-Parent Invitations**
2. User clicks **“Resend”** or **“Cancel”**
3. **Outcome:** Invitation status updates


## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no records exist
- [ ] All user actions work
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile
