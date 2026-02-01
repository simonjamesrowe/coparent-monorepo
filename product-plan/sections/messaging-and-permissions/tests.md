# Test Instructions: Messaging & Permissions

These test-writing instructions are framework-agnostic. Adapt them to your testing setup.

## Overview

Professional parent-to-parent communication platform combining threaded messaging with formal permission request workflows. Parents can send messages, create permission requests for decisions requiring approval, and track the status of all communications in a unified interface.

---

## User Flow Tests

### Flow 1: Send and receive messages in chat-style conversations with threading

**Scenario:** Send and receive messages in chat-style conversations with threading

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

### Flow 2: Mark messages as read/unread to track communication status

**Scenario:** Mark messages as read/unread to track communication status

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

### Flow 3: Create permission requests for medical decisions, travel plans, schedule changes, or extracurricular activities

**Scenario:** Create permission requests for medical decisions, travel plans, schedule changes, or extracurricular activities

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
