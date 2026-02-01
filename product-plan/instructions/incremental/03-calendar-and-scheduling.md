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
