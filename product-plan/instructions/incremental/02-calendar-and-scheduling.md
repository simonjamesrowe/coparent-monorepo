# Milestone 2: Calendar & Scheduling

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

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
