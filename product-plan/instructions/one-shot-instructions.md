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

### Problems Solved

**Problem 1: Fragmented Communication Creates Conflict and Legal Risk**
A dedicated, professional communication channel with structured workflows (permissions, approvals, requests) that maintains a timestamped, immutable record of all discussions and decisions.

**Problem 2: Financial Opacity Prevents Trust and Fair Contribution**
A comprehensive expense tracking system with receipt uploads, budget visibility, automatic reimbursement requests, and optional bank integration—ensuring financial transparency builds trust rather than destroying it.

**Problem 3: Missing Documentation Hurts Legal Standing**
A secure, organized information repository where medical records, school documents, emergency contacts, and important life events are stored, timestamped, and easily accessible to both parents.

### Key Features

- Parent-to-Parent Messaging with threading and permanent records
- Shared Calendar Management with custody schedules
- Permission Request Workflow for formal approvals
- Expense Tracking & Reimbursement with receipt uploads
- Information Repository for medical/school records
- Evidence Timeline for documented milestones
- Photo Sharing for family connection
- Multi-Child Support

## Planned Sections

1. **Calendar & Scheduling** — Shared calendar for custody schedules, activities, appointments, and important dates with real-time sync between parents.
2. **Messaging & Permissions** — Professional parent-to-parent communication with threading, plus formal permission request workflows for approvals and decisions.
3. **Expenses & Finances** — Expense tracking with receipt uploads, reimbursement requests, approval workflows, and spending analytics.
4. **Information Repository** — Centralized storage for medical records, school documents, emergency contacts, and critical family information.
5. **Timeline & Photos** — Chronological evidence timeline documenting milestones and achievements, plus private family photo albums.
6. **User Signup & Family Management** — Account creation, child profile setup, family roles, and invite flow to bring a non-registered co-parent into the platform.

## Data Model

**Core Entities:**
- **Family** — A co-parenting unit containing two parents and their shared children
- **Parent** — A user of the system with authentication credentials and profile information
- **Child** — A child being co-parented with calendar events, expenses, documents, and timeline
- **Event** — A calendar entry for custody periods, activities, appointments, or important dates
- **Message** — Communication between parents with threading support
- **PermissionRequest** — Formal request for approval on decisions
- **Expense** — Tracked cost with category, amount, and optional receipt
- **Document** — Stored file (medical records, school documents, etc.)
- **Milestone** — Timestamped entry in the evidence timeline
- **AuditEntry** — Immutable record of changes to any entity

**Note:** This product uses MongoDB (document database), not a relational database.

See `data-model/README.md` for detailed entity descriptions and relationships.

## Design System

**Colors:**
- Primary: `teal` — Used for buttons, links, key accents
- Secondary: `rose` — Used for notifications and alerts
- Neutral: `slate` — Used for backgrounds, text, and borders

**Typography:**
- Heading: Inter
- Body: Inter
- Mono: IBM Plex Mono

**Aesthetic:** "Calm Harbor" — Professional, trustworthy, and calming design that reduces stress and conflict.

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing structure, and application shell
2. **Calendar & Scheduling** — Shared calendar with custody schedules and event management
3. **User Signup & Family Management** — Onboarding wizard and family setup hub
4. **Messaging & Permissions** — Parent communication and permission request workflows *(Not yet designed)*
5. **Expenses & Finances** — Expense tracking and reimbursement system *(Not yet designed)*
6. **Information Repository** — Document storage and organization *(Not yet designed)*
7. **Timeline & Photos** — Evidence timeline and photo sharing *(Not yet designed)*

Each milestone has a dedicated instruction document in `product-plan/instructions/incremental/`.

**Note:** Only milestones 1-3 have been designed and are ready for implementation. The remaining sections are planned but do not yet have screen designs or components.

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

**Design System Summary:**
- **Primary Color:** Teal (for buttons, links, active states)
- **Secondary Color:** Rose (for notifications, alerts)
- **Neutral Color:** Slate (for backgrounds, text, borders)
- **Fonts:** Inter (heading and body), IBM Plex Mono (monospace)

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for interface definitions
- See `product-plan/data-model/README.md` for entity relationships

**Core Entities:**
- Family, Parent, Child
- Event, Message, PermissionRequest
- Expense, Document, Milestone
- AuditEntry

**Note:** This product uses MongoDB (document database). The data model reflects document-based relationships.

### 3. Routing Structure

Create placeholder routes for each section:

- `/` or `/dashboard` — Dashboard/home (default landing)
- `/calendar` — Calendar & Scheduling section
- `/messages` — Messaging & Permissions section
- `/expenses` — Expenses & Finances section
- `/documents` — Information Repository section
- `/timeline` — Timeline & Photos section
- `/settings` — User preferences
- `/onboarding` — User signup and family setup (for new users)
- `/family-setup` — Family setup hub (for existing users)

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu with avatar

**Wire Up Navigation:**

Connect navigation to your routing. The shell includes these nav items:

- **Dashboard** → `/` or `/dashboard`
- **Calendar** → `/calendar`
- **Messages** → `/messages`
- **Expenses** → `/expenses`
- **Documents** → `/documents`
- **Timeline** → `/timeline`
- **Settings** → `/settings` (separated at bottom)

**User Menu:**

The user menu expects:
- User name (string)
- Avatar URL (optional string, shows initials if not provided)
- `onLogout` callback (function)

**Responsive Behavior:**
- **Desktop (1024px+):** Fixed 260px sidebar, content fills remaining space
- **Tablet (768px-1023px):** Collapsible sidebar with hamburger toggle
- **Mobile (<768px):** Sidebar becomes slide-out drawer

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components
- `product-plan/shell/screenshot.png` — Shell visual reference (if available)

## Done When

- [ ] Design tokens are configured
- [ ] Data model types are defined in your project
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with navigation
- [ ] Navigation links to correct routes
- [ ] User menu shows user info and logout works
- [ ] Responsive on mobile, tablet, and desktop
- [ ] Active nav item is highlighted based on current route

---


## Goal

Implement the Calendar & Scheduling feature — a shared calendar system that enables co-parents to manage custody schedules, activities, appointments, and important dates.

## Overview

This section provides co-parents with a comprehensive shared calendar that displays custody schedules, activities, appointments, and important dates. Parents can view time in monthly, weekly, or daily formats with color-coding to clearly distinguish which parent has custody. Schedule changes require formal approval from the other parent, maintaining trust and accountability.

**Key Functionality:**
- View calendar in monthly, weekly, or daily views with color-coded custody blocks
- Create and edit custody schedules with custom day-by-day configuration
- Add events (activities, medical appointments, school events, holidays, custom categories)
- Request schedule changes (swap days, adjust times) that require approval
- Approve or decline incoming schedule change requests with notes
- Create and manage custom event categories with icons and colors

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

- `CalendarView.tsx` — Main calendar component with view switching
- `CalendarHeader.tsx` — Calendar header with date navigation and view controls
- `MonthView.tsx` — Monthly calendar grid
- `WeekView.tsx` — Weekly calendar view
- `DayView.tsx` — Daily schedule view
- `EventPill.tsx` — Event pill display in calendar cells
- `EventCreationForm.tsx` — Form for creating/editing events
- `ScheduleChangeRequestModal.tsx` — Modal for requesting schedule changes
- `ScheduleChangeApproval.tsx` — Interface for approving/declining requests
- `CategoryManagement.tsx` — UI for managing custom event categories
- `PendingRequestsBadge.tsx` — Badge showing pending request count

### Data Layer

The components expect these data shapes:

**Event:**
- `id`, `type`, `title`, `startDate`, `endDate`, `startTime`, `endTime`, `allDay`
- `parentId` (which parent "owns" this event), `childIds`
- `categoryId`, `location`, `notes`, `recurring` (optional pattern)

**ScheduleChangeRequest:**
- `id`, `status` (pending/approved/declined)
- `requestedBy`, `requestedAt`, `resolvedBy`, `resolvedAt`
- `originalEventId`, `proposedChange`, `reason`, `responseNote`

**EventCategory:**
- `id`, `name`, `icon`, `color`, `isDefault`, `isSystem`

**Parent & Child:**
- Basic info (id, name, color for parent)

You'll need to:
- Create MongoDB schemas/models for these entities
- Create API endpoints for CRUD operations
- Connect real data to the components
- Implement approval workflow for schedule changes

### Callbacks

Wire up these user actions:

**Event Actions:**
- `onViewEvent(eventId)` — View event details
- `onCreateEvent()` — Open event creation form
- `onEditEvent(eventId)` — Edit existing event
- `onDeleteEvent(eventId)` — Delete event

**Schedule Change Request Actions:**
- `onRequestScheduleChange(eventId)` — Request change to existing event
- `onApproveRequest(requestId, responseNote?)` — Approve request
- `onDeclineRequest(requestId, responseNote?)` — Decline request
- `onViewRequest(requestId)` — View request details

**Category Actions:**
- `onCreateCategory()` — Create custom category
- `onEditCategory(categoryId)` — Edit category
- `onDeleteCategory(categoryId)` — Delete category

**View Actions:**
- `onChangeView(view)` — Switch between month/week/day
- `onNavigateDate(date)` — Navigate to different date

### Empty States

Implement empty state UI for when no records exist yet:

- **No events yet:** Show a helpful message and CTA to create the first event
- **No categories yet:** Guide users to create custom categories
- **No pending requests:** Show "All caught up" message in requests list
- **First-time user experience:** Prominently display "Add Event" button when calendar is empty

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/calendar-and-scheduling/README.md` — Feature overview and design intent
- `product-plan/sections/calendar-and-scheduling/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/calendar-and-scheduling/components/` — React components
- `product-plan/sections/calendar-and-scheduling/types.ts` — TypeScript interfaces
- `product-plan/sections/calendar-and-scheduling/sample-data.json` — Test data
- `product-plan/sections/calendar-and-scheduling/*.png` — Visual references (various views)

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Create a New Event

1. User clicks "Add Event" button in calendar header
2. User selects event type (custody, activity, medical, school, holiday)
3. User fills in title, date/time, selects child(ren), chooses category
4. User optionally adds location and notes
5. User clicks "Create Event" to save
6. **Outcome:** New event appears on calendar in correct date cell(s), color-coded by parent

### Flow 2: Request a Schedule Change

1. User clicks on an existing custody event
2. User clicks "Request Change" button
3. User selects change type (swap, extend, modify dates)
4. User specifies new dates/times and provides a reason
5. User submits the request
6. **Outcome:** Request appears in pending requests for other parent, notification badge updates

### Flow 3: Approve a Schedule Change Request

1. User sees pending request badge on calendar
2. User clicks to view pending requests
3. User reviews request details (original vs. proposed schedule)
4. User optionally adds a response note
5. User clicks "Approve" to accept the change
6. **Outcome:** Calendar updates with new schedule, request marked as approved, requester is notified

### Flow 4: Manage Custom Categories

1. User clicks "Manage Categories" button
2. User clicks "Add Category" to create new category
3. User enters category name, selects icon and color
4. User saves the category
5. **Outcome:** New category appears in event creation form dropdown

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data from MongoDB
- [ ] Empty states display properly when no events/requests/categories exist
- [ ] All event CRUD operations work (create, read, update, delete)
- [ ] Schedule change approval workflow functions correctly
- [ ] Custom categories can be created, edited, and deleted
- [ ] Calendar correctly displays events in month, week, and day views
- [ ] Events are color-coded by parent
- [ ] User can switch between views and navigate dates
- [ ] Pending request badge shows accurate count
- [ ] Matches the visual design
- [ ] Responsive on mobile, tablet, and desktop

---


## Goal

Implement the User Signup & Family Management feature — account creation and family setup, guiding a parent through creating a family, adding child profiles, and inviting a co-parent.

## Overview

This section covers initial account creation and family setup, providing a guided onboarding wizard that walks new users through the essential setup steps: creating a family, adding child profiles, and inviting their co-parent. After onboarding, a family setup hub allows users to review, manage, and edit their family configuration, invitations, and roles.

**Key Functionality:**
- Complete multi-step onboarding wizard (account → family → child → invite → review)
- View family setup hub with cards for Family, Children, Invitations, and Roles
- Manage co-parent invitations (send, resend, cancel) with status tracking
- Add, view, and edit child profile details
- Assign parent roles (Primary Parent, Co-parent)

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

- `OnboardingWizard.tsx` — Multi-step wizard for new user onboarding
- `FamilySetupHub.tsx` — Dashboard for managing family setup after onboarding

### Data Layer

The components expect these data shapes:

**Family:**
- `id`, `name`, `timeZone`
- `parentIds`, `childIds`, `invitationIds`
- `createdAt`

**Parent:**
- `id`, `familyId`, `fullName`, `email`
- `role` (primary | co-parent), `status` (active)
- `lastSignedInAt`

**Child:**
- `id`, `familyId`, `fullName`, `dateOfBirth`
- `school` (optional), `medicalNotes` (optional)

**Invitation:**
- `id`, `familyId`, `email`, `role`
- `status` (pending | accepted | expired | canceled)
- `sentAt`, `expiresAt`, `acceptedAt`, `canceledAt`

**OnboardingState:**
- `id`, `familyId`, `currentStep`, `completedSteps`
- `isComplete`, `lastUpdated`

You'll need to:
- Create MongoDB schemas/models for these entities
- Create API endpoints for family, parent, child, invitation CRUD
- Implement invitation workflow (send, accept, expire, cancel)
- Track onboarding progress per family
- Handle email delivery for invitations

### Callbacks

Wire up these user actions:

**Account & Family Actions:**
- `onCreateAccount()` — Create user account (may trigger auth flow)
- `onCreateFamily(name, timeZone)` — Create family during onboarding
- `onUpdateFamily(id, updates)` — Edit family details in hub
- `onSelectFamily(familyId)` — Switch active family (if multi-family support)

**Child Profile Actions:**
- `onAddChild(child)` — Add new child profile
- `onUpdateChild(id, updates)` — Edit child profile

**Invitation Actions:**
- `onInviteCoParent(familyId, email, role)` — Send invitation
- `onResendInvite(invitationId)` — Resend invitation email
- `onCancelInvite(invitationId)` — Cancel pending invitation

**Role Actions:**
- `onAssignRole(parentId, role)` — Assign or change parent role

**Onboarding Actions:**
- `onCompleteOnboarding(familyId)` — Mark onboarding as complete

### Props

The components use a `mode` prop to determine which view to show:
- `mode="wizard"` — Show onboarding wizard for new users
- `mode="hub"` — Show family setup hub for existing users

Route new users to the wizard, and route existing users to the hub.

### Empty States

Implement empty state UI for when no records exist yet:

- **No children yet:** Show "Add your first child" CTA in the hub
- **No invitations yet:** Show "Invite your co-parent" CTA
- **Invitation expired:** Show "Resend Invitation" option
- **First-time user:** The wizard guides them through each step with clear CTAs

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/user-signup-and-family-management/README.md` — Feature overview and design intent
- `product-plan/sections/user-signup-and-family-management/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/user-signup-and-family-management/components/` — React components
- `product-plan/sections/user-signup-and-family-management/types.ts` — TypeScript interfaces
- `product-plan/sections/user-signup-and-family-management/sample-data.json` — Test data

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Complete Onboarding Wizard

1. User creates an account (authentication handled separately)
2. **Step 1 - Family:** User enters family name and selects time zone
3. **Step 2 - Child:** User adds first child (name, date of birth, optional school/medical notes)
4. **Step 3 - Invite:** User enters co-parent's email and assigns role
5. **Step 4 - Review:** User reviews setup and clicks "Complete Setup"
6. **Outcome:** Family created, child profile added, invitation sent, user redirected to main app

### Flow 2: Add a Child Profile in Family Setup Hub

1. User navigates to Family Setup Hub
2. User clicks "Add Child" button in Children card
3. User fills in child's name, date of birth
4. User optionally adds school name and medical notes
5. User clicks "Save"
6. **Outcome:** New child appears in Children list in hub

### Flow 3: Send Co-parent Invitation

1. User is in Family Setup Hub
2. User clicks "Invite Co-parent" button in Invitations card
3. User enters co-parent's email address
4. User selects role (Primary Parent or Co-parent)
5. User clicks "Send Invitation"
6. **Outcome:** Invitation created with "Pending" status, email sent to co-parent

### Flow 4: Resend Expired Invitation

1. User sees invitation with "Expired" status in hub
2. User clicks "Resend" button
3. **Outcome:** New invitation sent, status changes to "Pending", expiration date updated

### Flow 5: Cancel Pending Invitation

1. User sees invitation with "Pending" status in hub
2. User clicks "Cancel" button
3. User confirms cancellation
4. **Outcome:** Invitation status changes to "Canceled", removed from active invitations list

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data from MongoDB
- [ ] Empty states display properly when no children/invitations exist
- [ ] Onboarding wizard completes all steps successfully
- [ ] New users are directed to wizard, existing users to hub
- [ ] Family can be created and edited
- [ ] Child profiles can be added and edited
- [ ] Invitations can be sent, resent, and canceled
- [ ] Invitation status is tracked correctly (pending, accepted, expired, canceled)
- [ ] Email invitations are sent to co-parent
- [ ] Roles can be assigned to parents
- [ ] Onboarding progress is tracked
- [ ] User is redirected to main app after completing onboarding
- [ ] Matches the visual design
- [ ] Responsive on mobile, tablet, and desktop
