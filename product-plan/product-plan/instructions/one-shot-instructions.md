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

Each section includes a `tests.md` file with detailed test-writing instructions.

# CoParent — Product Overview

## Summary

CoParent is a unified digital platform that helps separated and divorced parents coordinate parenting responsibilities, manage shared expenses, and maintain clear communication—reducing conflict, building trust, and creating a legally sound record of their co-parenting relationship.

## Planned Sections

1. **Dashboard** — Central hub providing at-a-glance family status, quick actions for profile and children management, invitation tracking, and key metrics across calendar, expenses, and messaging.
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
2. **Dashboard** — Central hub providing at-a-glance family status, quick actions for profile and children management, invitation tracking, and key metrics across calendar, expenses, and messaging.
3. **Calendar & Scheduling** — Shared calendar for custody schedules, activities, appointments, and important dates with real-time sync between parents.
4. **Messaging & Permissions** — Professional parent-to-parent communication with threading, plus formal permission request workflows for approvals and decisions.
5. **Expenses & Finances** — Expense tracking with receipt uploads, reimbursement requests, approval workflows, and spending analytics.
6. **Information Repository** — Centralized storage for medical records, school documents, emergency contacts, and critical family information.
7. **User Signup & Family Management** — Account creation, child profile setup, family roles, and invite flow to bring a non-registered co-parent into the platform.

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

- `/dashboard`
- `/calendar-and-scheduling`
- `/messaging-and-permissions`
- `/expenses-and-finances`
- `/information-repository`
- `/timeline-and-photos`
- `/user-signup-and-family-management`

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu with avatar

**Wire Up Navigation:**

Connect navigation to your routing:

- Dashboard
- Calendar & Scheduling
- Messaging & Permissions
- Expenses & Finances
- Information Repository
- Timeline & Photos
- User Signup & Family Management

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

## Done When

- [ ] Design tokens are configured
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with navigation
- [ ] Navigation links to correct routes
- [ ] User menu shows user info
- [ ] Responsive on mobile


---

# Milestone 2: Dashboard

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the Dashboard feature — Central hub providing at-a-glance family status, quick actions for profile and children management, invitation tracking, and key metrics across calendar, expenses, and messaging.

## Overview

The Dashboard is the central hub of the app, presenting family status at a glance through a bento-box layout of mixed-size widget cards. Users can manage their profile, children, and invitations via slide-out drawers, take quick actions from a prominent top bar, and navigate to full sections by clicking on summary widgets.

**Key Functionality:**

- View dashboard with bento-box layout of stat widgets and management cards
- Edit own profile (name, email, notifications) via slide-out drawer
- Add/edit children via slide-out drawer
- View pending invitations and resend/cancel them via slide-out drawer
- Use quick action buttons at top to add expense, create event, or send message
- Click any widget to navigate to its full section (Calendar, Expenses, Messaging, etc.)

## Recommended Approach: Test-Driven Development

See `product-plan/sections/dashboard/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/dashboard/components/`:

- `ChildrenDrawer`
- `DashboardOverview`
- `InvitationsDrawer`
- `ProfileDrawer`

### Data Layer

The components expect these data shapes:

- NotificationPreferences, Parent, Child, Family, Event, Expense, PermissionRequest, Message, Invitation, ActivityFeedItem, BudgetCategory, BudgetSummary, ApprovalsSummary, SetupChecklistItem, SetupChecklist, WidgetCard, QuickAction, ParentProfileUpdate

### Callbacks

Wire up these user actions:

- `onClose` — Callback triggered by user action.
- `onSaveProfile` — Save profile updates for the parent

### Empty States

Implement empty state UI for when no records exist yet.

## Files to Reference

- `product-plan/sections/dashboard/README.md` — Feature overview and design intent
- `product-plan/sections/dashboard/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/dashboard/components/` — React components
- `product-plan/sections/dashboard/types.ts` — TypeScript interfaces
- `product-plan/sections/dashboard/sample-data.json` — Test data
- `product-plan/sections/dashboard/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: View dashboard with bento-box layout of stat widgets and management cards

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 2: Edit own profile (name, email, notifications) via slide-out drawer

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 3: Add/edit children via slide-out drawer

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


---

# Milestone 3: Calendar & Scheduling

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the Calendar & Scheduling feature — Shared calendar for custody schedules, activities, appointments, and important dates with real-time sync between parents.

## Overview

A shared calendar system that enables co-parents to manage custody schedules, activities, appointments, and important dates. Parents can view time in monthly, weekly, or daily views with color-coding to clearly distinguish which parent has custody. Schedule changes require approval from the other parent.

**Key Functionality:**

- View calendar in monthly, weekly, or daily view with parent-colored custody blocks
- Create and edit custody schedules with custom day-by-day configuration
- Add events (activities, medical appointments, school events, holidays, custom categories)
- Request schedule changes (swap days, adjust times) which require other parent's approval
- Approve or decline incoming schedule change requests
- Create and manage custom event categories

## Recommended Approach: Test-Driven Development

See `product-plan/sections/calendar-and-scheduling/tests.md` for detailed test-writing instructions.

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

- Parent, Child, EventCategory, RecurringPattern, Event, ProposedChange, ScheduleChangeRequest

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

Implement empty state UI for when no records exist yet.

## Files to Reference

- `product-plan/sections/calendar-and-scheduling/README.md` — Feature overview and design intent
- `product-plan/sections/calendar-and-scheduling/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/calendar-and-scheduling/components/` — React components
- `product-plan/sections/calendar-and-scheduling/types.ts` — TypeScript interfaces
- `product-plan/sections/calendar-and-scheduling/sample-data.json` — Test data
- `product-plan/sections/calendar-and-scheduling/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: View calendar in monthly, weekly, or daily view with parent-colored custody blocks

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 2: Create and edit custody schedules with custom day-by-day configuration

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 3: Add events (activities, medical appointments, school events, holidays, custom categories)

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


---

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


---

# Milestone 5: Expenses & Finances

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the Expenses & Finances feature — Expense tracking with receipt uploads, reimbursement requests, approval workflows, and spending analytics.

## Overview

A comprehensive expense tracking and budgeting system that allows parents to manage bank accounts and credit cards, upload statements, identify child-related expenses to share with co-parents, and track spending against category budgets.

**Key Functionality:**

- Add Bank Account - User adds a savings account with bank name, account name, last 4 digits, and assigns an owner
- Add Credit Card - User adds a credit card with bank name, last 4 digits, card type (Visa/Mastercard/Amex), and assigns an owner
- Upload Statement - User uploads a CSV statement for an account, then maps CSV columns to fields (date, description, amount, etc.) and saves the mapping as a reusable template for that account
- Mark Statement Line as Child Expense - User reviews statement lines and marks relevant ones as child expenses, choosing whether co-parent approval is required; this creates a shared expense visible to both parents
- Add Manual Expense - User adds an expense directly without linking to a bank account or statement
- Manage Categories - User views predefined expense categories and can add custom categories

## Recommended Approach: Test-Driven Development

See `product-plan/sections/expenses-and-finances/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/expenses-and-finances/components/`:

- `AccountList`
- `AccountsOverview`
- `BudgetSetup`
- `CategoryManagement`
- `CsvUploadMapping`
- `Dashboard`
- `ExpenseList`
- `FinanceDashboard`
- `StatementLineReview`

### Data Layer

The components expect these data shapes:

- Family, Parent, Child, Account, CsvMappings, CsvMappingTemplate, Statement, StatementLine, Category, Budget, Expense, CategoryBreakdown, AccountSpend, DashboardSummary

### Callbacks

Wire up these user actions:

- `onAddBankAccount` — Called when a user adds a new bank account
- `onAddCreditCard` — Called when a user adds a new credit card
- `onUploadStatement` — Called when a user uploads a statement file
- `onSaveMappingTemplate` — Called when a user saves a CSV mapping template
- `onMarkLineAsChildExpense` — Called when a statement line is marked as a child expense
- `onAddManualExpense` — Called when a user adds a manual expense
- `onAddCategory` — Called when a user adds a custom category
- `onSetBudgetLimit` — Called when a user sets or updates a budget limit
- `onViewExpense` — Called when a user selects an expense from the list

### Empty States

Implement empty state UI for when no records exist yet.

## Files to Reference

- `product-plan/sections/expenses-and-finances/README.md` — Feature overview and design intent
- `product-plan/sections/expenses-and-finances/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/expenses-and-finances/components/` — React components
- `product-plan/sections/expenses-and-finances/types.ts` — TypeScript interfaces
- `product-plan/sections/expenses-and-finances/sample-data.json` — Test data
- `product-plan/sections/expenses-and-finances/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Add Bank Account - User adds a savings account with bank name, account name, last 4 digits, and assigns an owner

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 2: Add Credit Card - User adds a credit card with bank name, last 4 digits, card type (Visa/Mastercard/Amex), and assigns an owner

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 3: Upload Statement - User uploads a CSV statement for an account, then maps CSV columns to fields (date, description, amount, etc.) and saves the mapping as a reusable template for that account

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


---

# Milestone 6: Information Repository

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the Information Repository feature — Centralized storage for medical records, school documents, emergency contacts, and critical family information.

## Overview

A centralized repository for storing critical family information organized by child. Parents can manage medical records, school documents, and emergency contacts with full file attachment support. Both parents have equal access to view, add, and edit all stored information.

**Key Functionality:**

- View dashboard showing all children with quick stats (document counts, recent updates)
- Select a child to see their categories (Medical, School, Emergency Contacts)
- Browse items within a category and view details
- Add new records with text fields and file attachments
- Edit or delete existing records
- Add/edit emergency contacts with name, phone, relationship, address, email, and notes

## Recommended Approach: Test-Driven Development

See `product-plan/sections/information-repository/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/information-repository/components/`:

- `ChildCard`
- `ChildDetail`
- `DocumentDetail`
- `DocumentRow`
- `EmergencyContactCard`
- `RepositoryDashboard`

### Data Layer

The components expect these data shapes:

- Family, ChildCategoryStats, Child, DocumentFile, Attachment, Document, EmergencyContact, CategorySummary

### Callbacks

Wire up these user actions:

- `onSelectChild` — Called when a child is selected from the dashboard
- `onSelectCategory` — Called when a category is selected for a child
- `onViewDocument` — Called when a document is opened for viewing
- `onCreateDocument` — Called when a new document is created
- `onEditDocument` — Called when a document is edited
- `onDeleteDocument` — Called when a document is deleted
- `onUploadDocumentFile` — Called when a user uploads or replaces a document file
- `onCreateContact` — Called when a new emergency contact is added
- `onEditContact` — Called when an emergency contact is edited
- `onDeleteContact` — Called when an emergency contact is deleted

### Empty States

Implement empty state UI for when no records exist yet.

## Files to Reference

- `product-plan/sections/information-repository/README.md` — Feature overview and design intent
- `product-plan/sections/information-repository/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/information-repository/components/` — React components
- `product-plan/sections/information-repository/types.ts` — TypeScript interfaces
- `product-plan/sections/information-repository/sample-data.json` — Test data
- `product-plan/sections/information-repository/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: View dashboard showing all children with quick stats (document counts, recent updates)

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 2: Select a child to see their categories (Medical, School, Emergency Contacts)

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 3: Browse items within a category and view details

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


---

# Milestone 7: User Signup & Family Management

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the User Signup & Family Management feature — Account creation, child profile setup, family roles, and invite flow to bring a non-registered co-parent into the platform.

## Overview

This section covers initial account creation and family setup, guiding a parent through creating a family, adding a child profile, and inviting a co-parent. After onboarding, a family setup hub summarizes key entities and invitation status so users can complete or revise setup details.

**Key Functionality:**

- Complete onboarding wizard: create account → create family → add child profile → invite co-parent → review & finish.
- View family setup hub with cards for Family, Children, Invitations, and Roles.
- Manage invites: send, resend, or cancel a co-parent invitation and see status badges.
- Add or edit child profile details from the setup hub.
- Assign roles (Primary Parent, Co-parent) during invite or setup.

## Recommended Approach: Test-Driven Development

See `product-plan/sections/user-signup-and-family-management/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/user-signup-and-family-management/components/`:

- `FamilySetupHub`
- `OnboardingWizard`

### Data Layer

The components expect these data shapes:

- Family, Parent, Child, Invitation, OnboardingState

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

Implement empty state UI for when no records exist yet.

## Files to Reference

- `product-plan/sections/user-signup-and-family-management/README.md` — Feature overview and design intent
- `product-plan/sections/user-signup-and-family-management/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/user-signup-and-family-management/components/` — React components
- `product-plan/sections/user-signup-and-family-management/types.ts` — TypeScript interfaces
- `product-plan/sections/user-signup-and-family-management/sample-data.json` — Test data
- `product-plan/sections/user-signup-and-family-management/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Complete onboarding wizard: create account → create family → add child profile → invite co-parent → review & finish.

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 2: View family setup hub with cards for Family, Children, Invitations, and Roles.

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 3: Manage invites: send, resend, or cancel a co-parent invitation and see status badges.

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
