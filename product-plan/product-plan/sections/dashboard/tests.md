# Test Instructions: Dashboard

These test-writing instructions are framework-agnostic. Adapt them to your testing setup.

## Overview

The Dashboard is the central hub of the app, presenting family status at a glance through a bento-box layout of mixed-size widget cards. Users can manage their profile, children, and invitations via slide-out drawers, take quick actions from a prominent top bar, and navigate to full sections by clicking on summary widgets.

---

## User Flow Tests

### Flow 1: View dashboard with bento-box layout of stat widgets and management cards

**Scenario:** View dashboard with bento-box layout of stat widgets and management cards

#### Success Path

**Setup:**
- Seed sample data from `sample-data.json`

**Steps:**
1. User navigates to the section
2. User performs the action described in the flow
3. User confirms the change

**Expected Results:**
- [ ] UI updates to reflect the completed action
- [ ] Relevant callbacks fire with correct IDs
- [ ] Success state is visible

#### Failure Path

**Setup:**
- Simulate a failed API response

**Steps:**
1. Repeat the same action

**Expected Results:**
- [ ] Error message is displayed
- [ ] UI remains stable and user can retry

### Flow 2: Edit own profile (name, email, notifications) via slide-out drawer

**Scenario:** Edit own profile (name, email, notifications) via slide-out drawer

#### Success Path

**Setup:**
- Seed sample data from `sample-data.json`

**Steps:**
1. User navigates to the section
2. User performs the action described in the flow
3. User confirms the change

**Expected Results:**
- [ ] UI updates to reflect the completed action
- [ ] Relevant callbacks fire with correct IDs
- [ ] Success state is visible

#### Failure Path

**Setup:**
- Simulate a failed API response

**Steps:**
1. Repeat the same action

**Expected Results:**
- [ ] Error message is displayed
- [ ] UI remains stable and user can retry

### Flow 3: Add/edit children via slide-out drawer

**Scenario:** Add/edit children via slide-out drawer

#### Success Path

**Setup:**
- Seed sample data from `sample-data.json`

**Steps:**
1. User navigates to the section
2. User performs the action described in the flow
3. User confirms the change

**Expected Results:**
- [ ] UI updates to reflect the completed action
- [ ] Relevant callbacks fire with correct IDs
- [ ] Success state is visible

#### Failure Path

**Setup:**
- Simulate a failed API response

**Steps:**
1. Repeat the same action

**Expected Results:**
- [ ] Error message is displayed
- [ ] UI remains stable and user can retry

---

## Empty State Tests

### Primary Empty State

**Scenario:** Primary list is empty

**Expected Results:**
- [ ] Empty state message is visible
- [ ] Primary CTA is visible and functional

### Filtered/Search Empty State

**Scenario:** Filters return no results

**Expected Results:**
- [ ] Clear 'no results' message appears
- [ ] Reset option is available

---

## Component Interaction Tests

### Main Component

**Renders correctly:**
- [ ] Key data points are visible

**User interactions:**
- [ ] Primary CTA triggers expected callback
- [ ] Secondary actions work as expected

---

## Edge Cases

- [ ] Handles long text content without layout breaks
- [ ] Works with single-item and large datasets
- [ ] Transitions between empty and populated states

---

## Accessibility Checks

- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] Form fields have associated labels

---

## Sample Test Data

Use data from `sample-data.json` as a baseline.
