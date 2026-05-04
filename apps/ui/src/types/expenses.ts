// =============================================================================
// Data Types
// =============================================================================

export type AccountType = 'bank-account' | 'credit-card';
export type AccountSubtype = 'checking' | 'savings';
export type CardType = 'visa' | 'mastercard' | 'amex';

export interface Account {
  id: string;
  familyId: string;
  type: AccountType;
  bankName: string;
  accountName: string;
  last4: string;
  ownerParentId: string;
  accountSubtype?: AccountSubtype;
  cardType?: CardType;
}

export interface CsvMappings {
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  categoryColumn: string;
}

export interface CsvMappingTemplate {
  id: string;
  familyId: string;
  accountId?: string;
  name: string;
  mappings: CsvMappings;
  delimiter: string;
  hasHeaderRow: boolean;
  isPreset: boolean;
  bankNameMatch?: string;
  accountTypeMatch?: string;
  createdAt: string;
}

export interface Statement {
  id: string;
  familyId: string;
  accountId: string;
  fileName: string;
  uploadedAt: string;
  periodStart: string;
  periodEnd: string;
  mappingTemplateId?: string | null;
}

export interface StatementLine {
  id: string;
  familyId: string;
  statementId: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  categoryGuess?: string;
  isChildExpense: boolean;
  requiresApproval: boolean;
  linkedExpenseId?: string | null;
}

export type CategoryType = 'predefined' | 'custom';

export interface Category {
  id: string;
  familyId: string;
  name: string;
  type: CategoryType;
  color: string;
}

export type BudgetStatus = 'on_track' | 'near_limit' | 'over';

export interface Budget {
  id: string;
  familyId: string;
  categoryId: string;
  month: string;
  limit: number;
  spent: number;
  status: BudgetStatus;
}

export type ExpenseStatus = 'draft' | 'pending_approval' | 'approved' | 'reimbursed' | 'denied';
export type ExpenseSource = 'manual' | 'statement';

export interface Expense {
  id: string;
  familyId: string;
  childId?: string | null;
  createdByParentId: string;
  categoryId: string;
  amount: number;
  date: string;
  description: string;
  status: ExpenseStatus;
  requiresApproval: boolean;
  source: ExpenseSource;
  sourceStatementLineId?: string;
  receiptUrl?: string | null;
}

export interface CategoryBreakdown {
  categoryId: string;
  spent: number;
  budgetLimit?: number | null;
}

export interface AccountSpend {
  accountId: string;
  spent: number;
}

export interface DashboardSummary {
  month: string;
  totalSpent: number;
  totalChildExpenses: number;
  reimbursementsDue: number;
  categoryBreakdown: CategoryBreakdown[];
  accountSpend: AccountSpend[];
}
