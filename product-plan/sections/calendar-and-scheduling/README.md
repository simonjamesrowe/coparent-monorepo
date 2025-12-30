# Calendar & Scheduling

## Overview

A shared calendar system that enables co-parents to manage custody schedules, activities, appointments, and important dates. Parents can view time in monthly, weekly, or daily views with color-coding to clearly distinguish which parent has custody. Schedule changes require approval from the other parent.

## User Flows

1. **View calendar** in monthly, weekly, or daily view with parent-colored custody blocks
2. **Create and edit custody schedules** with custom day-by-day configuration
3. **Add events** (activities, medical appointments, school events, holidays, custom categories)
4. **Request schedule changes** (swap days, adjust times) which require other parent's approval
5. **Approve or decline incoming schedule change requests**
6. **Create and manage custom event categories**

## Design Decisions

**Calendar Views:** Three distinct views (month, week, day) give parents flexibility to see high-level patterns or drill into specific days.

**Color Coding:** Each parent has a consistent color used throughout the calendar to instantly show who has custody. This visual clarity reduces confusion and conflict.

**Approval Workflow:** Schedule changes require formal approval from the other parent, creating accountability and maintaining trust. The system shows original vs. proposed schedules side-by-side for easy comparison.

**Custom Categories:** Parents can create their own event categories beyond the system defaults (custody, medical, school, holiday), allowing personalization for sports, therapy, activities, etc.

**Empty States:** When the calendar has no events, prominent CTAs guide users to add their first event. Request lists show "All caught up" when empty.

## Data Used

**Entities:**
- Event (custody blocks, activities, appointments)
- EventCategory (system and custom categories)
- ScheduleChangeRequest (pending, approved, declined requests)
- Parent (for color-coding and ownership)
- Child (events can be linked to specific children)

**From global model:** Parent, Child (from data-model)

## Visual Reference

See screenshots for visual design of different calendar views:
- `calendar-view.png` — Month view with events
- `calendar-view-week.png` — Week view
- `calendar-view-day.png` — Day view
- `calendar-view-mobile.png` — Mobile responsive
- `calendar-view-dark.png` — Dark mode
- `schedule-change-request-modal.png` — Schedule change approval UI

## Components Provided

- `CalendarView` — Main calendar component with view switching
- `CalendarHeader` — Date navigation and view controls
- `MonthView` — Monthly calendar grid
- `WeekView` — Weekly calendar view
- `DayView` — Daily schedule view
- `EventPill` — Event pill display in calendar cells
- `EventCreationForm` — Form for creating/editing events
- `ScheduleChangeRequestModal` — Modal for requesting schedule changes
- `ScheduleChangeApproval` — Interface for approving/declining requests
- `CategoryManagement` — UI for managing custom event categories
- `PendingRequestsBadge` — Badge showing pending request count

## Callback Props

| Callback | Description |
|----------|-------------|
| `onViewEvent` | Called when user clicks to view event details |
| `onCreateEvent` | Called when user clicks to create new event |
| `onEditEvent` | Called when user edits an event |
| `onDeleteEvent` | Called when user deletes an event |
| `onRequestScheduleChange` | Called when user requests a change to an existing event |
| `onApproveRequest` | Called when user approves a schedule change request |
| `onDeclineRequest` | Called when user declines a schedule change request |
| `onViewRequest` | Called when user views request details |
| `onCreateCategory` | Called when user creates a custom category |
| `onEditCategory` | Called when user edits a category |
| `onDeleteCategory` | Called when user deletes a category |
| `onChangeView` | Called when user switches between month/week/day |
| `onNavigateDate` | Called when user navigates to a different date |
