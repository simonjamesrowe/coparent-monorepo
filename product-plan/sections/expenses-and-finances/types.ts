// =============================================================================
// Data Types
// =============================================================================

export interface Family {
  id: string
  name: string
  timezone: string
}

export interface Parent {
  id: string
  name: string
  email: string
  role: 'primary' | 'secondary'
}

export interface Child {
  id: string
  name: string
  birthdate: string
}

export type AccountType = 'bank-account' | 'credit-card'
export type AccountSubtype = 'checking' | 'savings'
export type CardType = 'visa' | 'mastercard' | 'amex'

export interface Account {
  id: string
  type: AccountType
  bankName: string
  accountName: string
  last4: string
  ownerParentId: string
  accountSubtype?: AccountSubtype
  cardType?: CardType
}

export interface CsvMappings {
  dateColumn: string
  descriptionColumn: string
  amountColumn: string
  categoryColumn: string
}

export interface CsvMappingTemplate {
  id: string
  accountId: string
  name: string
  mappings: CsvMappings
  delimiter: string
  hasHeaderRow: boolean
  createdAt: string
}

export interface Statement {
  id: string
  accountId: string
  fileName: string
  uploadedAt: string
  periodStart: string
  periodEnd: string
  mappingTemplateId?: string | null
}

export interface StatementLine {
  id: string
  statementId: string
  date: string
  description: string
  amount: number
  currency: string
  categoryGuess: string
  isChildExpense: boolean
  requiresApproval: boolean
  linkedExpenseId?: string | null
}

export type CategoryType = 'predefined' | 'custom'

export interface Category {
  id: string
  name: string
  type: CategoryType
  color: string
}

export type BudgetStatus = 'on_track' | 'near_limit' | 'over'

export interface Budget {
  id: string
  categoryId: string
  month: string
  limit: number
  spent: number
  status: BudgetStatus
}

export type ExpenseStatus = 'draft' | 'pending_approval' | 'approved' | 'reimbursed' | 'denied'
export type ExpenseSource = 'manual' | 'statement'

export interface Expense {
  id: string
  familyId: string
  childId?: string | null
  createdByParentId: string
  categoryId: string
  amount: number
  date: string
  description: string
  status: ExpenseStatus
  requiresApproval: boolean
  source: ExpenseSource
  sourceStatementLineId?: string
  receiptUrl?: string | null
}

export interface CategoryBreakdown {
  categoryId: string
  spent: number
  budgetLimit?: number | null
}

export interface AccountSpend {
  accountId: string
  spent: number
}

export interface DashboardSummary {
  month: string
  totalSpent: number
  totalChildExpenses: number
  reimbursementsDue: number
  categoryBreakdown: CategoryBreakdown[]
  accountSpend: AccountSpend[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface ExpensesAndFinancesProps {
  /** The family context for this workspace */
  family: Family
  /** Available parents for account ownership and approvals */
  parents: Parent[]
  /** Children available for linking expenses */
  children: Child[]
  /** Bank accounts and credit cards */
  accounts: Account[]
  /** Uploaded statements for accounts */
  statements: Statement[]
  /** Parsed statement lines */
  statementLines: StatementLine[]
  /** Saved CSV mapping templates per account */
  csvMappingTemplates: CsvMappingTemplate[]
  /** Expense categories */
  categories: Category[]
  /** Budgets per category/month */
  budgets: Budget[]
  /** Expenses shown in lists and dashboards */
  expenses: Expense[]
  /** Aggregated dashboard summary for charts */
  dashboardSummary: DashboardSummary
  /** Empty when no approvals are pending */
  pendingApprovals: string[]
  /** Called when a user adds a new bank account */
  onAddBankAccount?: (account: Account) => void
  /** Called when a user adds a new credit card */
  onAddCreditCard?: (account: Account) => void
  /** Called when a user uploads a statement file */
  onUploadStatement?: (statement: Statement) => void
  /** Called when a user saves a CSV mapping template */
  onSaveMappingTemplate?: (template: CsvMappingTemplate) => void
  /** Called when a statement line is marked as a child expense */
  onMarkLineAsChildExpense?: (lineId: string, requiresApproval: boolean) => void
  /** Called when a user adds a manual expense */
  onAddManualExpense?: (expense: Expense) => void
  /** Called when a user adds a custom category */
  onAddCategory?: (category: Category) => void
  /** Called when a user sets or updates a budget limit */
  onSetBudgetLimit?: (categoryId: string, month: string, limit: number) => void
  /** Called when a user selects an expense from the list */
  onViewExpense?: (expenseId: string) => void
}
