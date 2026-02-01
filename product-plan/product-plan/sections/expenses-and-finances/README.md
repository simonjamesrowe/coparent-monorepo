# Expenses & Finances

## Overview

A comprehensive expense tracking and budgeting system that allows parents to manage bank accounts and credit cards, upload statements, identify child-related expenses to share with co-parents, and track spending against category budgets.

## User Flows

- Add Bank Account - User adds a savings account with bank name, account name, last 4 digits, and assigns an owner
- Add Credit Card - User adds a credit card with bank name, last 4 digits, card type (Visa/Mastercard/Amex), and assigns an owner
- Upload Statement - User uploads a CSV statement for an account, then maps CSV columns to fields (date, description, amount, etc.) and saves the mapping as a reusable template for that account
- Mark Statement Line as Child Expense - User reviews statement lines and marks relevant ones as child expenses, choosing whether co-parent approval is required; this creates a shared expense visible to both parents
- Add Manual Expense - User adds an expense directly without linking to a bank account or statement
- Manage Categories - User views predefined expense categories and can add custom categories
- Set Budget Limits - User sets monthly budget limits per category
- View Expense List - User browses expenses with filters for date range, category, and account
- View Dashboard - User sees spending summaries, charts, and budget vs actuals by category

## Design Decisions

- Account list view showing all bank accounts and credit cards with their details
- CSV upload with interactive field mapping screen (column preview, dropdown selectors for field assignment)
- Statement line review screen with checkboxes or actions to mark lines as child expenses
- Expense list with filtering and sorting capabilities
- Dashboard with spending charts and budget progress indicators
- Category management screen for viewing/adding categories
- Budget setup screen with category limits and current spend tracking

## Data Used

**Entities:** Family, Parent, Child, Account, CsvMappings, CsvMappingTemplate, Statement, StatementLine, Category, Budget, Expense, CategoryBreakdown, AccountSpend, DashboardSummary

**From global model:** Family, Parent, Child, Expense

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `AccountList` — Supporting UI component
- `AccountsOverview` — Main view component
- `BudgetSetup` — Supporting UI component
- `CategoryManagement` — Supporting UI component
- `CsvUploadMapping` — Supporting UI component
- `Dashboard` — Primary dashboard view
- `ExpenseList` — Supporting UI component
- `FinanceDashboard` — Primary dashboard view
- `StatementLineReview` — Main view component

## Callback Props

| Callback | Description |
|----------|-------------|
| `onAddBankAccount` | Called when a user adds a new bank account |
| `onAddCreditCard` | Called when a user adds a new credit card |
| `onUploadStatement` | Called when a user uploads a statement file |
| `onSaveMappingTemplate` | Called when a user saves a CSV mapping template |
| `onMarkLineAsChildExpense` | Called when a statement line is marked as a child expense |
| `onAddManualExpense` | Called when a user adds a manual expense |
| `onAddCategory` | Called when a user adds a custom category |
| `onSetBudgetLimit` | Called when a user sets or updates a budget limit |
| `onViewExpense` | Called when a user selects an expense from the list |
