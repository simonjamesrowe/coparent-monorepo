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
