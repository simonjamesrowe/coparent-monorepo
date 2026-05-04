import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { DashboardSummary, Category, Budget, Account, Expense } from '../../types/expenses';

import { Dashboard } from './Dashboard';

const baseProps = {
  dashboardSummary: {
    month: '2026-02',
    totalSpent: 0,
    totalChildExpenses: 0,
    reimbursementsDue: 0,
    categoryBreakdown: [],
    accountSpend: [],
  } as DashboardSummary,
  categories: [] as Category[],
  budgets: [] as Budget[],
  accounts: [] as Account[],
  expenses: [] as Expense[],
  parents: [],
};

describe('Dashboard', () => {
  it('renders summary cards', () => {
    const props = {
      ...baseProps,
      dashboardSummary: {
        ...baseProps.dashboardSummary,
        totalSpent: 1250,
      },
    };

    render(<Dashboard {...props} />);

    expect(screen.getByText('$1,250')).toBeInTheDocument();
    expect(screen.getByText('Total Spent')).toBeInTheDocument();
  });

  it('renders empty state gracefully', () => {
    render(<Dashboard {...baseProps} />);

    expect(screen.getByText('No expenses recorded yet')).toBeInTheDocument();
  });

  it('renders category breakdown', () => {
    const props = {
      ...baseProps,
      categories: [
        { id: 'cat-1', familyId: 'fam-1', name: 'Food', type: 'predefined', color: 'teal' },
        { id: 'cat-2', familyId: 'fam-1', name: 'School', type: 'predefined', color: 'violet' },
      ] as Category[],
      dashboardSummary: {
        ...baseProps.dashboardSummary,
        categoryBreakdown: [
          { categoryId: 'cat-1', spent: 500, budgetLimit: null },
          { categoryId: 'cat-2', spent: 300, budgetLimit: null },
        ],
      },
    };

    render(<Dashboard {...props} />);

    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('School')).toBeInTheDocument();
  });
});
