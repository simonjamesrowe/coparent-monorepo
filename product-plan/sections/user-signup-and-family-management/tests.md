# Test Instructions: User Signup & Family Management

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

Validate onboarding wizard flows (account → family → child → invite → review) and the family setup hub. Key labels include **“Create Account”**, **“Continue”**, **“Add Child”**, **“Send Invite”**, and **“Complete Setup.”**

---

## User Flow Tests

### Flow 1: Complete the Onboarding Wizard

**Scenario:** User completes the full onboarding wizard.

**Steps:**
1. On **Account** step, fill **Full Name**, **Email Address**, **Password**, then click **“Create Account.”**
2. On **Family** step, enter **Family Name** and select **Time Zone**, then click **“Continue.”**
3. On **Children** step, enter **Child's Full Name** and **Date of Birth**, then click **“Add Child.”**
4. Click **“Continue.”**
5. On **Invite** step, enter **Co-Parent's Email Address**, choose a role, click **“Send Invite”** (or **“Skip for now”**).
6. On **Review** step, click **“Complete Setup.”**

**Expected Results:**
- [ ] Wizard progresses through all steps.
- [ ] `onCreateAccount`, `onCreateFamily`, `onAddChild`, `onInviteCoParent`, and `onCompleteOnboarding` callbacks fire.
- [ ] Review summary lists Family and Children data.

### Flow 2: Manage Invitations in Family Setup Hub

**Scenario:** User resends or cancels a pending invite.

**Steps:**
1. Open **Co-Parent Invitations** card.
2. Click **“Resend”** on a pending invite.
3. Click **“Cancel”** on a pending invite.

**Expected Results:**
- [ ] `onResendInvite` called with invite id.
- [ ] `onCancelInvite` called with invite id.
- [ ] Pending status updates if state changes.

### Flow 3: Add a Child from Family Setup Hub

**Scenario:** User adds a child from the hub empty state.

**Steps:**
1. In **Children** card, click **“Add Your First Child.”**

**Expected Results:**
- [ ] `onAddChild` callback fires.
- [ ] Child card appears in list.

---

## Empty State Tests

### No Family Selected

**Scenario:** No active family is selected.

**Expected Results:**
- [ ] “No family selected” message appears.

### No Children

**Scenario:** Family has zero children.

**Expected Results:**
- [ ] “No children added yet” message appears.
- [ ] “Add Your First Child” CTA is visible.

### No Invitations

**Scenario:** Family has no invitations.

**Expected Results:**
- [ ] “No invitations sent” message appears.
- [ ] “Send First Invitation” CTA is visible.

---

## Component Interaction Tests

- [ ] **Role Assignment** buttons toggle between **Primary Parent** and **Co-Parent**.
- [ ] **Edit** button in Family Details calls `onUpdateFamily`.
- [ ] Status badges show **Pending / Accepted / Expired / Canceled** for invitations.

---

## Edge Cases

- [ ] Continue buttons remain disabled when required fields are empty.
- [ ] Added child list renders multiple children with initials.
- [ ] Invite step handles existing pending invitations display.

---

## Accessibility Checks

- [ ] Stepper and buttons are keyboard accessible.
- [ ] Inputs have visible labels and focus rings.
- [ ] Error/disabled states are visually distinct.

---

## Sample Test Data

```typescript
const family = { id: 'fam-001', name: 'Kingston Family', timeZone: 'America/New_York' }
const child = { id: 'chi-001', familyId: 'fam-001', fullName: 'Ava Kingston', dateOfBirth: '2016-04-12' }
const invite = { id: 'inv-001', familyId: 'fam-001', email: 'co-parent@kingstonfamily.com', status: 'pending', role: 'co-parent' }
```
