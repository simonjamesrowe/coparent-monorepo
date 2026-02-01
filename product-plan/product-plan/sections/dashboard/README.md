# Dashboard

## Overview

The Dashboard is the central hub of the app, presenting family status at a glance through a bento-box layout of mixed-size widget cards. Users can manage their profile, children, and invitations via slide-out drawers, take quick actions from a prominent top bar, and navigate to full sections by clicking on summary widgets.

## User Flows

- View dashboard with bento-box layout of stat widgets and management cards
- Edit own profile (name, email, notifications) via slide-out drawer
- Add/edit children via slide-out drawer
- View pending invitations and resend/cancel them via slide-out drawer
- Use quick action buttons at top to add expense, create event, or send message
- Click any widget to navigate to its full section (Calendar, Expenses, Messaging, etc.)
- View pending approvals count across expenses, schedule changes, and permissions
- View next 3-5 upcoming events at a glance
- View budget summary showing spending vs limits
- Track family setup progress (children added, co-parent invited)
- Browse recent activity feed across all sections

## Design Decisions

- Bento-box grid layout with mixed-size widget cards
- Quick actions bar at top with prominent action buttons
- Slide-out drawer pattern for profile, children, and invitation editing
- Clickable widgets that navigate to full sections
- Stats displayed as compact metric cards
- Recent activity feed as a scrollable list widget
- Family setup progress indicator (percentage or checklist style)

## Data Used

**Entities:** NotificationPreferences, Parent, Child, Family, Event, Expense, PermissionRequest, Message, Invitation, ActivityFeedItem, BudgetCategory, BudgetSummary, ApprovalsSummary, SetupChecklistItem, SetupChecklist, WidgetCard, QuickAction, ParentProfileUpdate

**From global model:** Parent, Child, Family, Event, Expense, PermissionRequest, Message

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `ChildrenDrawer` — Slide-out drawer panel
- `DashboardOverview` — Primary dashboard view
- `InvitationsDrawer` — Slide-out drawer panel
- `ProfileDrawer` — Slide-out drawer panel

## Callback Props

| Callback | Description |
|----------|-------------|
| `onClose` | Callback triggered by user action. |
| `onSaveProfile` | Save profile updates for the parent |
