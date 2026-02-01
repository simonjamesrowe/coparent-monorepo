# Test Instructions: Information Repository

These test-writing instructions are framework-agnostic. Adapt them to your testing setup.

## Overview

A centralized repository for storing critical family information organized by child. Parents can manage medical records, school documents, and emergency contacts with full file attachment support. Both parents have equal access to view, add, and edit all stored information.

---

## User Flow Tests

### Flow 1: View dashboard showing all children with quick stats (document counts, recent updates)

**Scenario:** View dashboard showing all children with quick stats (document counts, recent updates)

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

### Flow 2: Select a child to see their categories (Medical, School, Emergency Contacts)

**Scenario:** Select a child to see their categories (Medical, School, Emergency Contacts)

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

### Flow 3: Browse items within a category and view details

**Scenario:** Browse items within a category and view details

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
