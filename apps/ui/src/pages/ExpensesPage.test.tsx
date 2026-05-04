import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as apiHooks from '../hooks/api';

import ExpensesPage from './ExpensesPage';

vi.mock('../hooks/api', () => ({
  useFamilies: vi.fn(),
  useParents: vi.fn(),
  useChildren: vi.fn(),
  useAccounts: vi.fn(),
  useExpenseCategories: vi.fn(),
  useCsvMappingTemplates: vi.fn(),
  useStatements: vi.fn(),
  useStatementLines: vi.fn(),
  useExpenses: vi.fn(),
  useBudgets: vi.fn(),
  useDashboardSummary: vi.fn(),
  useSeedExpenseCategories: vi.fn(),
  useCreateAccount: vi.fn(),
  useDeleteAccount: vi.fn(),
  useCreateBudget: vi.fn(),
  useUpdateBudget: vi.fn(),
  useCreateExpenseCategory: vi.fn(),
  useCreateExpense: vi.fn(),
  useUpdateStatementLine: vi.fn(),
}));

const mockedUseFamilies = vi.mocked(apiHooks.useFamilies);
const mockedUseParents = vi.mocked(apiHooks.useParents);
const mockedUseChildren = vi.mocked(apiHooks.useChildren);
const mockedUseAccounts = vi.mocked(apiHooks.useAccounts);
const mockedUseExpenseCategories = vi.mocked(apiHooks.useExpenseCategories);
const mockedUseCsvMappingTemplates = vi.mocked(apiHooks.useCsvMappingTemplates);
const mockedUseStatements = vi.mocked(apiHooks.useStatements);
const mockedUseStatementLines = vi.mocked(apiHooks.useStatementLines);
const mockedUseExpenses = vi.mocked(apiHooks.useExpenses);
const mockedUseBudgets = vi.mocked(apiHooks.useBudgets);
const mockedUseDashboardSummary = vi.mocked(apiHooks.useDashboardSummary);
const mockedUseSeedExpenseCategories = vi.mocked(apiHooks.useSeedExpenseCategories);
const mockedUseCreateAccount = vi.mocked(apiHooks.useCreateAccount);
const mockedUseDeleteAccount = vi.mocked(apiHooks.useDeleteAccount);
const mockedUseCreateBudget = vi.mocked(apiHooks.useCreateBudget);
const mockedUseUpdateBudget = vi.mocked(apiHooks.useUpdateBudget);
const mockedUseCreateExpenseCategory = vi.mocked(apiHooks.useCreateExpenseCategory);
const mockedUseCreateExpense = vi.mocked(apiHooks.useCreateExpense);
const mockedUseUpdateStatementLine = vi.mocked(apiHooks.useUpdateStatementLine);

describe('ExpensesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseFamilies.mockReturnValue({
      data: [
        {
          id: 'fam-1',
          name: 'Test Family',
          timeZone: 'America/New_York',
          parentIds: ['parent-1'],
          childIds: ['child-1'],
          invitationIds: [],
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useFamilies>);

    mockedUseParents.mockReturnValue({
      data: [
        {
          id: 'parent-1',
          familyId: 'fam-1',
          fullName: 'Alex Parent',
          email: 'alex@test.com',
          role: 'primary',
          status: 'active',
          color: '#0d9488',
          avatarUrl: '',
          auth0Id: 'auth0|test',
          lastSignedInAt: '2026-01-01',
        },
      ],
    } as unknown as ReturnType<typeof apiHooks.useParents>);

    mockedUseChildren.mockReturnValue({
      data: [
        {
          id: 'child-1',
          familyId: 'fam-1',
          fullName: 'Test Child',
          dateOfBirth: '2016-05-10',
          school: 'Test School',
          medicalNotes: '',
        },
      ],
    } as unknown as ReturnType<typeof apiHooks.useChildren>);

    mockedUseAccounts.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof apiHooks.useAccounts>);

    mockedUseExpenseCategories.mockReturnValue({
      data: [
        {
          _id: 'cat-1',
          id: 'cat-1',
          familyId: 'fam-1',
          name: 'Food',
          type: 'predefined',
          color: 'teal',
        },
      ],
    } as unknown as ReturnType<typeof apiHooks.useExpenseCategories>);

    mockedUseCsvMappingTemplates.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof apiHooks.useCsvMappingTemplates>);

    mockedUseStatements.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof apiHooks.useStatements>);

    mockedUseStatementLines.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof apiHooks.useStatementLines>);

    mockedUseExpenses.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof apiHooks.useExpenses>);

    mockedUseBudgets.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof apiHooks.useBudgets>);

    mockedUseDashboardSummary.mockReturnValue({
      data: {
        month: '2026-02',
        totalSpent: 0,
        totalChildExpenses: 0,
        reimbursementsDue: 0,
        categoryBreakdown: [],
        accountSpend: [],
      },
    } as unknown as ReturnType<typeof apiHooks.useDashboardSummary>);

    mockedUseSeedExpenseCategories.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof apiHooks.useSeedExpenseCategories>);

    mockedUseCreateAccount.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof apiHooks.useCreateAccount>);

    mockedUseDeleteAccount.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof apiHooks.useDeleteAccount>);

    mockedUseCreateBudget.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof apiHooks.useCreateBudget>);

    mockedUseUpdateBudget.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof apiHooks.useUpdateBudget>);

    mockedUseCreateExpenseCategory.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof apiHooks.useCreateExpenseCategory>);

    mockedUseCreateExpense.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof apiHooks.useCreateExpense>);

    mockedUseUpdateStatementLine.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof apiHooks.useUpdateStatementLine>);
  });

  it('renders loading state', () => {
    mockedUseFamilies.mockReturnValue({
      data: [],
      isLoading: true,
    } as unknown as ReturnType<typeof apiHooks.useFamilies>);

    render(
      <MemoryRouter>
        <ExpensesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders dashboard tab by default', async () => {
    render(
      <MemoryRouter>
        <ExpensesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Expenses Dashboard')).toBeInTheDocument();
    });
  });

  it('switches to accounts tab', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ExpensesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Accounts' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Accounts' }));

    await waitFor(() => {
      expect(screen.getByText('Accounts & Cards')).toBeInTheDocument();
    });
  });

  it('switches to categories tab', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ExpensesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Categories' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Categories' }));

    await waitFor(() => {
      expect(screen.getByText('Organize spending categories')).toBeInTheDocument();
    });
  });
});
