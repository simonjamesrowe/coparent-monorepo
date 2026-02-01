# Test Instructions: Calendar & Scheduling

These test-writing instructions are framework-agnostic. Adapt them to your testing setup.

## Overview

A shared calendar system that enables co-parents to manage custody schedules, activities, appointments, and important dates. Parents can view time in monthly, weekly, or daily views with color-coding to clearly distinguish which parent has custody. Schedule changes require approval from the other parent.

---

## User Flow Tests

### Flow 1: View calendar in monthly, weekly, or daily view with parent-colored custody blocks

**Scenario:** View calendar in monthly, weekly, or daily view with parent-colored custody blocks

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

### Flow 2: Create and edit custody schedules with custom day-by-day configuration

**Scenario:** Create and edit custody schedules with custom day-by-day configuration

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

### Flow 3: Add events (activities, medical appointments, school events, holidays, custom categories)

**Scenario:** Add events (activities, medical appointments, school events, holidays, custom categories)

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
