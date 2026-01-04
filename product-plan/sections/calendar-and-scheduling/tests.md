# Test Instructions: Calendar & Scheduling

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

Validate the shared calendar experience: view toggles (Month/Week/Day), event creation, schedule change requests, approvals, and category management. The UI includes key labels like **“Family Calendar”**, **“Add Event”**, **“Today”**, and form controls like **“Title”** and **“Save Event.”**

---

## User Flow Tests

### Flow 1: Create a New Event

**Scenario:** A parent adds a new activity or appointment to the shared calendar.

#### Success Path

**Setup:**
- Parents, children, eventCategories, and events are loaded.

**Steps:**
1. User clicks **“Add Event”** in the calendar header.
2. User enters a **Title** (e.g., “Emma Soccer Practice”).
3. User selects **Event type** (Activity/Medical/School/Holiday/Custody).
4. User chooses a **Category**.
5. User sets **Start date** and **End date** (for custody) or time fields.
6. User clicks **“Save Event.”**

**Expected Results:**
- [ ] `onSubmit` is called with event payload.
- [ ] Event appears in the calendar grid/day view.
- [ ] “This Month” stat increases when event is in the current month.

#### Failure Path: Missing Required Fields

**Setup:**
- Leave **Title** empty.

**Steps:**
1. Click **“Save Event.”**

**Expected Results:**
- [ ] Save is blocked (button disabled or no submit).
- [ ] Event is not created.

### Flow 2: Request a Schedule Change

**Scenario:** A parent proposes a custody schedule change requiring approval.

#### Success Path

**Setup:**
- A custody event exists and a schedule change drawer is accessible.

**Steps:**
1. Open **“Request Schedule Change.”**
2. Choose **“Swap Days”** or **“Adjust Time.”**
3. Set **New start date** and **New end date**.
4. Enter **“Reason for Request”** (at least 10 characters).
5. Click **“Send Request.”**

**Expected Results:**
- [ ] `onSubmit` is called with proposedChange and reason.
- [ ] Request shows as **pending** in the approvals list.

#### Failure Path: Short Reason

**Setup:**
- Enter fewer than 10 characters in **Reason for Request**.

**Expected Results:**
- [ ] Send is disabled.
- [ ] No request is submitted.

### Flow 3: Approve or Decline a Schedule Change

**Scenario:** The other parent reviews and responds to a pending request.

**Steps:**
1. Navigate to **“Schedule Change Approvals.”**
2. Filter to **“Pending.”**
3. Select a request from the list.
4. Enter **“Response note (optional).”**
5. Click **“Approve change”** or **“Decline.”**

**Expected Results:**
- [ ] `onApproveRequest` or `onDeclineRequest` is called with request id.
- [ ] Status badge updates (approved/declined).
- [ ] Response note displays in the timeline panel if provided.

---

## Empty State Tests

### Approval List Empty State

**Scenario:** No requests match the current filter.

**Setup:**
- Filter requests to a status with zero items.

**Expected Results:**
- [ ] “No requests in this view.” message appears.

### Category Usage Empty State

**Scenario:** Selected category has no events.

**Expected Results:**
- [ ] “No events tagged yet. Add one from the calendar.” is visible.

---

## Component Interaction Tests

### Calendar Header

- [ ] Clicking **“Today”** resets to today’s date.
- [ ] View buttons **“Month / Week / Day”** call `onChangeView`.
- [ ] Prev/Next arrows call navigation callbacks.

### Event Creation Form

- [ ] “Cancel” calls `onCancel`.
- [ ] “Save Event” calls `onSubmit` with correct payload.
- [ ] Event type selection toggles custody behavior (all-day, end date).

---

## Edge Cases

- [ ] Very long event titles truncate in pills.
- [ ] All-day custody events render without time labels.
- [ ] Recurring weekly events show correct recurrence chip.
- [ ] Incoming pending requests show **Pending** badge count.

---

## Accessibility Checks

- [ ] All form fields have visible labels.
- [ ] Buttons are keyboard-accessible (Add Event, Save Event, Approve change).
- [ ] Focus is visible on drawer open and close.

---

## Sample Test Data

Use the data from `sample-data.json` or create variations:

```typescript
const sampleEvent = {
  id: 'evt-005',
  type: 'activity',
  title: 'Soccer Practice',
  startDate: '2025-01-07',
  startTime: '16:00',
  endTime: '17:30',
  allDay: false,
  parentId: null,
  childIds: ['child-001'],
  categoryId: 'cat-soccer',
  location: 'Riverside Sports Complex'
}

const sampleRequest = {
  id: 'req-001',
  status: 'pending',
  requestedBy: 'parent-002',
  proposedChange: {
    type: 'swap',
    newStartDate: '2025-01-18',
    newEndDate: '2025-01-21'
  },
  reason: 'Need to shift for a work conflict.'
}
```
