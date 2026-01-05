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
