# Calendar & Scheduling

## Overview

A shared calendar system that enables co-parents to manage custody schedules, activities, appointments, and important dates. Parents can view time in monthly, weekly, or daily views with color-coding to clearly distinguish which parent has custody. Schedule changes require approval from the other parent.

## User Flows

- View calendar in monthly, weekly, or daily view with parent-colored custody blocks
- Create and edit custody schedules with custom day-by-day configuration
- Add events (activities, medical appointments, school events, holidays, custom categories)
- Request schedule changes (swap days, adjust times) which require other parent's approval
- Approve or decline incoming schedule change requests
- Create and manage custom event categories

## Design Decisions

- Calendar with toggleable monthly/weekly/daily views
- Color-coded custody blocks distinguishing each parent's time
- Event markers within calendar days showing activities and appointments
- Schedule change request drawer with proposed changes and reason field
- Pending requests notification/badge
- Approval interface showing original vs. proposed schedule
- Event creation form with category selection (including custom categories)
- Category management for adding custom event types

## Data Used

**Entities:** Parent, Child, EventCategory, RecurringPattern, Event, ProposedChange, ScheduleChangeRequest

**From global model:** Parent, Child, Event

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `CalendarHeader` — Supporting UI component
- `CalendarView` — Main view component
- `CategoryManagement` — Supporting UI component
- `DayView` — Main view component
- `EventCreationForm` — Form layout
- `EventPill` — Supporting UI component
- `MonthView` — Main view component
- `PendingRequestsBadge` — Supporting UI component
- `ScheduleChangeApproval` — Supporting UI component
- `ScheduleChangeRequestModal` — Modal dialog
- `WeekView` — Main view component

## Callback Props

| Callback | Description |
|----------|-------------|
| `onViewEvent` | Called when user wants to view event details |
| `onCreateEvent` | Called when user wants to create a new event |
| `onEditEvent` | Called when user wants to edit an event |
| `onDeleteEvent` | Called when user wants to delete an event |
| `onRequestScheduleChange` | Called when user wants to request a schedule change |
| `onApproveRequest` | Called when user approves a schedule change request |
| `onDeclineRequest` | Called when user declines a schedule change request |
| `onViewRequest` | Called when user wants to view request details |
| `onCreateCategory` | Called when user wants to create a custom category |
| `onEditCategory` | Called when user wants to edit a category |
| `onDeleteCategory` | Called when user wants to delete a category |
| `onChangeView` | Called when user changes the calendar view |
| `onNavigateDate` | Called when user navigates to a different date |
