# Test Instructions: Expenses & Finances

These test-writing instructions are framework-agnostic. Adapt them to your testing setup.

## Overview

A comprehensive expense tracking and budgeting system that allows parents to manage bank accounts and credit cards, upload statements, identify child-related expenses to share with co-parents, and track spending against category budgets.

---

## User Flow Tests

### Flow 1: Add Bank Account - User adds a savings account with bank name, account name, last 4 digits, and assigns an owner

**Scenario:** Add Bank Account - User adds a savings account with bank name, account name, last 4 digits, and assigns an owner

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

### Flow 2: Add Credit Card - User adds a credit card with bank name, last 4 digits, card type (Visa/Mastercard/Amex), and assigns an owner

**Scenario:** Add Credit Card - User adds a credit card with bank name, last 4 digits, card type (Visa/Mastercard/Amex), and assigns an owner

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

### Flow 3: Upload Statement - User uploads a CSV statement for an account, then maps CSV columns to fields (date, description, amount, etc.) and saves the mapping as a reusable template for that account

**Scenario:** Upload Statement - User uploads a CSV statement for an account, then maps CSV columns to fields (date, description, amount, etc.) and saves the mapping as a reusable template for that account

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
