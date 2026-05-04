import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  Dashboard,
  AccountList,
  AddAccountForm,
  ExpenseList,
  AddExpenseForm,
  CsvUploadMapping,
  StatementLineReview,
  BudgetSetup,
  CategoryManagement,
} from '../components/expenses';
import {
  useFamilies,
  useParents,
  useChildren,
  useAccounts,
  useExpenseCategories,
  useCsvMappingTemplates,
  useStatements,
  useStatementLines,
  useExpenses,
  useBudgets,
  useDashboardSummary,
  useSeedExpenseCategories,
  useCreateAccount,
  useDeleteAccount,
  useCreateBudget,
  useUpdateBudget,
  useCreateExpenseCategory,
  useCreateExpense,
  useUpdateStatementLine,
} from '../hooks/api';
import type {
  Account,
  Statement,
  StatementLine,
  CsvMappingTemplate,
  Category,
  Budget,
  Expense,
  DashboardSummary,
} from '../types/expenses';

type TabKey = 'dashboard' | 'accounts' | 'expenses' | 'statements' | 'budgets' | 'categories';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'statements', label: 'Statements' },
  { key: 'budgets', label: 'Budgets' },
  { key: 'categories', label: 'Categories' },
];

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const unwrapId = (value: string | { _id?: string } | null | undefined): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value._id ?? undefined;
};

const normalizeRecord = (
  record: Record<string, unknown>,
): Record<string, unknown> & { id: string } => ({
  ...record,
  id: (record._id ?? record.id ?? '') as string,
});

const ExpensesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: families = [], isLoading: familiesLoading } = useFamilies();
  const [activeFamilyId, setActiveFamilyId] = useState<string | undefined>();
  const [currentMonth] = useState(getCurrentMonth);

  // UI state
  const [addAccountType, setAddAccountType] = useState<'bank-account' | 'credit-card' | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeStatementId, setActiveStatementId] = useState<string | undefined>();

  const activeTab = (searchParams.get('tab') as TabKey) || 'dashboard';
  const setActiveTab = (tab: TabKey) => setSearchParams({ tab });

  // Data hooks
  const { data: parents = [] } = useParents(activeFamilyId);
  const { data: children = [] } = useChildren(activeFamilyId);
  const { data: rawAccounts = [] } = useAccounts(activeFamilyId);
  const { data: rawCategories = [] } = useExpenseCategories(activeFamilyId);
  const { data: rawTemplates = [] } = useCsvMappingTemplates(activeFamilyId);
  const { data: rawStatements = [] } = useStatements(activeFamilyId);
  const { data: rawStatementLines = [] } = useStatementLines(activeFamilyId, activeStatementId);
  const { data: rawExpenses = [] } = useExpenses(activeFamilyId);
  const { data: rawBudgets = [] } = useBudgets(activeFamilyId, currentMonth);
  const { data: rawDashboardSummary } = useDashboardSummary(activeFamilyId, currentMonth);

  // Mutations
  const seedCategories = useSeedExpenseCategories();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const createCategory = useCreateExpenseCategory();
  const createExpense = useCreateExpense();
  const updateStatementLine = useUpdateStatementLine();

  useEffect(() => {
    const [firstFamily] = families;
    if (!activeFamilyId && firstFamily) {
      setActiveFamilyId(firstFamily.id);
    }
  }, [activeFamilyId, families]);

  // Seed categories on first load if none exist
  useEffect(() => {
    if (activeFamilyId && rawCategories.length === 0 && !seedCategories.isPending) {
      seedCategories.mutate({ familyId: activeFamilyId });
    }
  }, [activeFamilyId, rawCategories.length]);

  // Auto-select first statement for line loading
  useEffect(() => {
    if (rawStatements.length > 0 && !activeStatementId) {
      const first = rawStatements[0] as Record<string, unknown>;
      setActiveStatementId((first._id ?? first.id) as string);
    }
  }, [rawStatements, activeStatementId]);

  // Transform data for components
  const parentsList = useMemo(
    () =>
      parents.map((p) => ({
        id: p.id,
        name: p.fullName?.split(' ')[0] || p.fullName || 'Parent',
      })),
    [parents],
  );

  const childrenList = useMemo(
    () =>
      children.map((c) => ({
        id: c.id,
        name: c.fullName?.split(' ')[0] || c.fullName || 'Child',
      })),
    [children],
  );

  const accounts: Account[] = useMemo(
    () =>
      (rawAccounts as unknown as Array<Record<string, unknown>>).map((a) => {
        const rec = normalizeRecord(a);
        return {
          id: rec.id,
          familyId: unwrapId(rec.familyId as string) || '',
          type: (rec.type as Account['type']) || 'bank-account',
          bankName: (rec.bankName as string) || '',
          accountName: (rec.accountName as string) || '',
          last4: (rec.last4 as string) || '',
          ownerParentId: unwrapId(rec.ownerParentId as string) || '',
          accountSubtype: rec.accountSubtype as Account['accountSubtype'],
          cardType: rec.cardType as Account['cardType'],
        };
      }),
    [rawAccounts],
  );

  const categories: Category[] = useMemo(
    () =>
      (rawCategories as unknown as Array<Record<string, unknown>>).map((c) => {
        const rec = normalizeRecord(c);
        return {
          id: rec.id,
          familyId: unwrapId(rec.familyId as string) || '',
          name: (rec.name as string) || '',
          type: (rec.type as Category['type']) || 'custom',
          color: (rec.color as string) || 'teal',
        };
      }),
    [rawCategories],
  );

  const csvMappingTemplates: CsvMappingTemplate[] = useMemo(
    () =>
      (rawTemplates as unknown as Array<Record<string, unknown>>).map((t) => {
        const rec = normalizeRecord(t);
        return {
          id: rec.id,
          familyId: unwrapId(rec.familyId as string) || '',
          accountId: unwrapId(rec.accountId as string),
          name: (rec.name as string) || '',
          mappings: (rec.mappings as CsvMappingTemplate['mappings']) || {
            dateColumn: '',
            descriptionColumn: '',
            amountColumn: '',
            categoryColumn: '',
          },
          delimiter: (rec.delimiter as string) || ',',
          hasHeaderRow: (rec.hasHeaderRow as boolean) ?? true,
          isPreset: (rec.isPreset as boolean) ?? false,
          bankNameMatch: rec.bankNameMatch as string | undefined,
          accountTypeMatch: rec.accountTypeMatch as string | undefined,
          createdAt: (rec.createdAt as string) || '',
        };
      }),
    [rawTemplates],
  );

  const statements: Statement[] = useMemo(
    () =>
      (rawStatements as unknown as Array<Record<string, unknown>>).map((s) => {
        const rec = normalizeRecord(s);
        return {
          id: rec.id,
          familyId: unwrapId(rec.familyId as string) || '',
          accountId: unwrapId(rec.accountId as string) || '',
          fileName: (rec.fileName as string) || '',
          uploadedAt: (rec.uploadedAt as string) || '',
          periodStart: (rec.periodStart as string) || '',
          periodEnd: (rec.periodEnd as string) || '',
          mappingTemplateId: unwrapId(rec.mappingTemplateId as string) || null,
        };
      }),
    [rawStatements],
  );

  const statementLines: StatementLine[] = useMemo(
    () =>
      (rawStatementLines as unknown as Array<Record<string, unknown>>).map((l) => {
        const rec = normalizeRecord(l);
        return {
          id: rec.id,
          familyId: unwrapId(rec.familyId as string) || '',
          statementId: unwrapId(rec.statementId as string) || '',
          date: (rec.date as string) || '',
          description: (rec.description as string) || '',
          amount: (rec.amount as number) || 0,
          currency: (rec.currency as string) || 'USD',
          categoryGuess: rec.categoryGuess as string | undefined,
          isChildExpense: (rec.isChildExpense as boolean) ?? false,
          requiresApproval: (rec.requiresApproval as boolean) ?? false,
          linkedExpenseId: rec.linkedExpenseId as string | null | undefined,
        };
      }),
    [rawStatementLines],
  );

  const expenses: Expense[] = useMemo(
    () =>
      (rawExpenses as unknown as Array<Record<string, unknown>>).map((e) => {
        const rec = normalizeRecord(e);
        return {
          id: rec.id,
          familyId: unwrapId(rec.familyId as string) || '',
          childId: unwrapId(rec.childId as string) || null,
          createdByParentId: unwrapId(rec.createdByParentId as string) || '',
          categoryId: unwrapId(rec.categoryId as string) || '',
          amount: (rec.amount as number) || 0,
          date: (rec.date as string) || '',
          description: (rec.description as string) || '',
          status: (rec.status as Expense['status']) || 'draft',
          requiresApproval: (rec.requiresApproval as boolean) ?? false,
          source: (rec.source as Expense['source']) || 'manual',
          sourceStatementLineId: unwrapId(rec.sourceStatementLineId as string),
          receiptUrl: rec.receiptUrl as string | null | undefined,
        };
      }),
    [rawExpenses],
  );

  const budgets: Budget[] = useMemo(
    () =>
      (rawBudgets as unknown as Array<Record<string, unknown>>).map((b) => {
        const rec = normalizeRecord(b);
        return {
          id: rec.id,
          familyId: unwrapId(rec.familyId as string) || '',
          categoryId: unwrapId(rec.categoryId as string) || '',
          month: (rec.month as string) || currentMonth,
          limit: (rec.limit as number) || 0,
          spent: (rec.spent as number) || 0,
          status: (rec.status as Budget['status']) || 'on_track',
        };
      }),
    [rawBudgets, currentMonth],
  );

  const dashboardSummary: DashboardSummary = useMemo(
    () =>
      rawDashboardSummary
        ? {
            month: (rawDashboardSummary as unknown as Record<string, unknown>).month as string,
            totalSpent:
              ((rawDashboardSummary as unknown as Record<string, unknown>).totalSpent as number) ||
              0,
            totalChildExpenses:
              ((rawDashboardSummary as unknown as Record<string, unknown>)
                .totalChildExpenses as number) || 0,
            reimbursementsDue:
              ((rawDashboardSummary as unknown as Record<string, unknown>)
                .reimbursementsDue as number) || 0,
            categoryBreakdown:
              ((rawDashboardSummary as unknown as Record<string, unknown>)
                .categoryBreakdown as DashboardSummary['categoryBreakdown']) || [],
            accountSpend:
              ((rawDashboardSummary as unknown as Record<string, unknown>)
                .accountSpend as DashboardSummary['accountSpend']) || [],
          }
        : {
            month: currentMonth,
            totalSpent: 0,
            totalChildExpenses: 0,
            reimbursementsDue: 0,
            categoryBreakdown: [],
            accountSpend: [],
          },
    [rawDashboardSummary, currentMonth],
  );

  // Handlers
  const handleAddAccount = useCallback(
    async (data: {
      type: 'bank-account' | 'credit-card';
      bankName: string;
      accountName: string;
      last4: string;
      ownerParentId: string;
      accountSubtype?: 'checking' | 'savings';
      cardType?: 'visa' | 'mastercard' | 'amex';
    }) => {
      if (!activeFamilyId) return;
      await createAccount.mutateAsync({
        familyId: activeFamilyId,
        ...data,
      });
      setAddAccountType(null);
    },
    [activeFamilyId, createAccount],
  );

  const handleDeleteAccount = useCallback(
    async (accountId: string) => {
      if (!activeFamilyId) return;
      await deleteAccount.mutateAsync({ id: accountId, familyId: activeFamilyId });
    },
    [activeFamilyId, deleteAccount],
  );

  const handleSetBudgetLimit = useCallback(
    async (categoryId: string, month: string, limit: number) => {
      if (!activeFamilyId) return;
      const existingBudget = budgets.find((b) => b.categoryId === categoryId && b.month === month);
      if (existingBudget) {
        await updateBudget.mutateAsync({
          id: existingBudget.id,
          familyId: activeFamilyId,
          limit,
        });
      } else {
        await createBudget.mutateAsync({
          familyId: activeFamilyId,
          categoryId,
          month,
          limit,
        });
      }
    },
    [activeFamilyId, budgets, createBudget, updateBudget],
  );

  const handleAddCategory = useCallback(
    async (category: { name: string; color: string }) => {
      if (!activeFamilyId) return;
      await createCategory.mutateAsync({ familyId: activeFamilyId, ...category });
    },
    [activeFamilyId, createCategory],
  );

  const handleCreateExpense = useCallback(
    async (data: {
      categoryId: string;
      amount: number;
      date: string;
      description: string;
      childId?: string | null;
      requiresApproval: boolean;
    }) => {
      if (!activeFamilyId) return;
      await createExpense.mutateAsync({
        familyId: activeFamilyId,
        source: 'manual',
        ...data,
      });
      setShowAddExpense(false);
    },
    [activeFamilyId, createExpense],
  );

  const handleMarkLineAsChildExpense = useCallback(
    async (lineId: string, requiresApproval: boolean) => {
      if (!activeFamilyId) return;
      // Find the statement that contains this line
      const line = statementLines.find((l) => l.id === lineId);
      const statementId = line?.statementId || activeStatementId;
      if (!statementId) return;
      await updateStatementLine.mutateAsync({
        familyId: activeFamilyId,
        statementId,
        lineId,
        isChildExpense: true,
        requiresApproval,
      });
    },
    [activeFamilyId, statementLines, activeStatementId, updateStatementLine],
  );

  if (familiesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!activeFamilyId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">
          No family found. Please set up your family first.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-teal-500 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && (
          <Dashboard
            dashboardSummary={dashboardSummary}
            categories={categories}
            budgets={budgets}
            accounts={accounts}
            expenses={expenses}
            parents={parentsList}
            onViewExpenses={() => setActiveTab('expenses')}
            onViewBudgets={() => setActiveTab('budgets')}
            onViewAccounts={() => setActiveTab('accounts')}
          />
        )}

        {activeTab === 'accounts' && (
          <div>
            {addAccountType && (
              <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
                <AddAccountForm
                  type={addAccountType}
                  parents={parentsList}
                  onSubmit={handleAddAccount}
                  onCancel={() => setAddAccountType(null)}
                />
              </div>
            )}
            <AccountList
              accounts={accounts}
              statements={statements}
              parents={parentsList}
              csvMappingTemplates={csvMappingTemplates}
              onAddBankAccount={() => setAddAccountType('bank-account')}
              onAddCreditCard={() => setAddAccountType('credit-card')}
              onDeleteAccount={handleDeleteAccount}
              onUploadStatement={() => setActiveTab('statements')}
            />
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            {showAddExpense ? (
              <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
                <AddExpenseForm
                  categories={categories}
                  children={childrenList}
                  onSubmit={handleCreateExpense}
                  onCancel={() => setShowAddExpense(false)}
                />
              </div>
            ) : (
              <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:-translate-y-0.5 hover:bg-teal-500"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Add Expense
                  </button>
                </div>
              </div>
            )}
            <ExpenseList
              expenses={expenses}
              categories={categories}
              accounts={accounts}
              children={childrenList}
              parents={parentsList}
              statements={statements}
              statementLines={statementLines}
            />
          </div>
        )}

        {activeTab === 'statements' && (
          <div>
            <CsvUploadMapping
              accounts={accounts}
              statements={statements}
              statementLines={statementLines}
              csvMappingTemplates={csvMappingTemplates}
            />
            {statements.length > 0 && (
              <StatementLineReview
                statements={statements}
                statementLines={statementLines}
                accounts={accounts}
                categories={categories}
                onMarkLineAsChildExpense={handleMarkLineAsChildExpense}
              />
            )}
          </div>
        )}

        {activeTab === 'budgets' && (
          <BudgetSetup
            budgets={budgets}
            categories={categories}
            onSetBudgetLimit={handleSetBudgetLimit}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryManagement categories={categories} onAddCategory={handleAddCategory} />
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;
