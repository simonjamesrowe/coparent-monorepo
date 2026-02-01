# Milestone 5: Expenses & Finances

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the Expenses & Finances feature — Expense tracking with receipt uploads, reimbursement requests, approval workflows, and spending analytics.

## Overview

A comprehensive expense tracking and budgeting system that allows parents to manage bank accounts and credit cards, upload statements, identify child-related expenses to share with co-parents, and track spending against category budgets.

**Key Functionality:**

- Add Bank Account - User adds a savings account with bank name, account name, last 4 digits, and assigns an owner
- Add Credit Card - User adds a credit card with bank name, last 4 digits, card type (Visa/Mastercard/Amex), and assigns an owner
- Upload Statement - User uploads a CSV statement for an account, then maps CSV columns to fields (date, description, amount, etc.) and saves the mapping as a reusable template for that account
- Mark Statement Line as Child Expense - User reviews statement lines and marks relevant ones as child expenses, choosing whether co-parent approval is required; this creates a shared expense visible to both parents
- Add Manual Expense - User adds an expense directly without linking to a bank account or statement
- Manage Categories - User views predefined expense categories and can add custom categories

## Recommended Approach: Test-Driven Development

See `product-plan/sections/expenses-and-finances/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/expenses-and-finances/components/`:

- `AccountList`
- `AccountsOverview`
- `BudgetSetup`
- `CategoryManagement`
- `CsvUploadMapping`
- `Dashboard`
- `ExpenseList`
- `FinanceDashboard`
- `StatementLineReview`

### Data Layer

The components expect these data shapes:

- Family, Parent, Child, Account, CsvMappings, CsvMappingTemplate, Statement, StatementLine, Category, Budget, Expense, CategoryBreakdown, AccountSpend, DashboardSummary

### Callbacks

Wire up these user actions:

- `onAddBankAccount` — Called when a user adds a new bank account
- `onAddCreditCard` — Called when a user adds a new credit card
- `onUploadStatement` — Called when a user uploads a statement file
- `onSaveMappingTemplate` — Called when a user saves a CSV mapping template
- `onMarkLineAsChildExpense` — Called when a statement line is marked as a child expense
- `onAddManualExpense` — Called when a user adds a manual expense
- `onAddCategory` — Called when a user adds a custom category
- `onSetBudgetLimit` — Called when a user sets or updates a budget limit
- `onViewExpense` — Called when a user selects an expense from the list

### Empty States

Implement empty state UI for when no records exist yet.

## Files to Reference

- `product-plan/sections/expenses-and-finances/README.md` — Feature overview and design intent
- `product-plan/sections/expenses-and-finances/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/expenses-and-finances/components/` — React components
- `product-plan/sections/expenses-and-finances/types.ts` — TypeScript interfaces
- `product-plan/sections/expenses-and-finances/sample-data.json` — Test data
- `product-plan/sections/expenses-and-finances/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Add Bank Account - User adds a savings account with bank name, account name, last 4 digits, and assigns an owner

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 2: Add Credit Card - User adds a credit card with bank name, last 4 digits, card type (Visa/Mastercard/Amex), and assigns an owner

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 3: Upload Statement - User uploads a CSV statement for an account, then maps CSV columns to fields (date, description, amount, etc.) and saves the mapping as a reusable template for that account

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
