import { useMemo } from 'react'
import type {
  DashboardSummary,
  Category,
  Budget,
  Account,
  Expense,
  Parent,
} from '../types'

const COLOR_STYLES: Record<string, { bg: string; ring: string; text: string; fill: string }> = {
  lime: { bg: 'bg-lime-500/15', ring: 'ring-lime-300/50', text: 'text-lime-600 dark:text-lime-400', fill: 'bg-lime-500' },
  sky: { bg: 'bg-sky-500/15', ring: 'ring-sky-300/50', text: 'text-sky-600 dark:text-sky-400', fill: 'bg-sky-500' },
  amber: { bg: 'bg-amber-500/15', ring: 'ring-amber-300/50', text: 'text-amber-600 dark:text-amber-400', fill: 'bg-amber-500' },
  violet: { bg: 'bg-violet-500/15', ring: 'ring-violet-300/50', text: 'text-violet-600 dark:text-violet-400', fill: 'bg-violet-500' },
  rose: { bg: 'bg-rose-500/15', ring: 'ring-rose-300/50', text: 'text-rose-600 dark:text-rose-400', fill: 'bg-rose-500' },
  cyan: { bg: 'bg-cyan-500/15', ring: 'ring-cyan-300/50', text: 'text-cyan-600 dark:text-cyan-400', fill: 'bg-cyan-500' },
  orange: { bg: 'bg-orange-500/15', ring: 'ring-orange-300/50', text: 'text-orange-600 dark:text-orange-400', fill: 'bg-orange-500' },
  emerald: { bg: 'bg-emerald-500/15', ring: 'ring-emerald-300/50', text: 'text-emerald-600 dark:text-emerald-400', fill: 'bg-emerald-500' },
  fuchsia: { bg: 'bg-fuchsia-500/15', ring: 'ring-fuchsia-300/50', text: 'text-fuchsia-600 dark:text-fuchsia-400', fill: 'bg-fuchsia-500' },
  stone: { bg: 'bg-stone-500/15', ring: 'ring-stone-300/50', text: 'text-stone-600 dark:text-stone-400', fill: 'bg-stone-500' },
  teal: { bg: 'bg-teal-500/15', ring: 'ring-teal-300/50', text: 'text-teal-600 dark:text-teal-400', fill: 'bg-teal-500' },
}

function getColorStyles(color: string) {
  return COLOR_STYLES[color] || COLOR_STYLES.teal
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export interface DashboardProps {
  dashboardSummary: DashboardSummary
  categories: Category[]
  budgets: Budget[]
  accounts: Account[]
  expenses: Expense[]
  parents: Parent[]
  onViewExpenses?: () => void
  onViewBudgets?: () => void
  onViewAccounts?: () => void
  onViewExpense?: (expenseId: string) => void
}

export function Dashboard({
  dashboardSummary,
  categories,
  budgets,
  accounts,
  expenses,
  parents,
  onViewExpenses,
  onViewBudgets,
  onViewAccounts,
  onViewExpense,
}: DashboardProps) {
  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {}
    categories.forEach(cat => { map[cat.id] = cat })
    return map
  }, [categories])

  const accountMap = useMemo(() => {
    const map: Record<string, Account> = {}
    accounts.forEach(acc => { map[acc.id] = acc })
    return map
  }, [accounts])

  const parentMap = useMemo(() => {
    const map: Record<string, Parent> = {}
    parents.forEach(p => { map[p.id] = p })
    return map
  }, [parents])

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [expenses])

  const pendingExpenses = useMemo(() => {
    return expenses.filter(e => e.status === 'pending_approval')
  }, [expenses])

  const maxCategorySpend = useMemo(() => {
    return Math.max(...dashboardSummary.categoryBreakdown.map(c => c.spent), 1)
  }, [dashboardSummary])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            Financial Overview
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            Expenses Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {formatMonth(dashboardSummary.month)} spending summary
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/30 dark:shadow-slate-900/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Total Spent</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {formatCurrency(dashboardSummary.totalSpent)}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/30 dark:shadow-slate-900/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Child Expenses</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {formatCurrency(dashboardSummary.totalChildExpenses)}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/30 dark:shadow-slate-900/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
              </div>
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Reimbursements Due</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {formatCurrency(dashboardSummary.reimbursementsDue)}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/30 dark:shadow-slate-900/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Pending Approval</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {pendingExpenses.length}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Category Breakdown */}
            <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/30 dark:shadow-slate-900/30">
              <div className="flex items-center justify-between p-5 border-b border-slate-200/60 dark:border-slate-700/60">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Spending by Category</h2>
                <button
                  type="button"
                  onClick={onViewBudgets}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                >
                  Manage Budgets
                </button>
              </div>
              <div className="p-5 space-y-4">
                {dashboardSummary.categoryBreakdown.map((item) => {
                  const category = categoryMap[item.categoryId]
                  if (!category) return null
                  const styles = getColorStyles(category.color)
                  const percentage = item.budgetLimit ? Math.min((item.spent / item.budgetLimit) * 100, 100) : 0
                  const isOverBudget = item.budgetLimit && item.spent > item.budgetLimit

                  return (
                    <div key={item.categoryId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ring-1 ${styles.ring} ${styles.bg} flex items-center justify-center`}>
                            <span className={`text-xs font-bold ${styles.text}`}>
                              {category.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{category.name}</p>
                            {item.budgetLimit && (
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                of {formatCurrency(item.budgetLimit)} budget
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {formatCurrency(item.spent)}
                          </p>
                          {isOverBudget && (
                            <p className="text-xs text-rose-500 dark:text-rose-400">Over budget</p>
                          )}
                        </div>
                      </div>
                      {item.budgetLimit ? (
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : styles.fill}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      ) : (
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${styles.fill}`}
                            style={{ width: `${(item.spent / maxCategorySpend) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Account Spending */}
            <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/30 dark:shadow-slate-900/30">
              <div className="flex items-center justify-between p-5 border-b border-slate-200/60 dark:border-slate-700/60">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Spending by Account</h2>
                <button
                  type="button"
                  onClick={onViewAccounts}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                >
                  View All Accounts
                </button>
              </div>
              <div className="p-5 space-y-3">
                {dashboardSummary.accountSpend.map((item) => {
                  const account = accountMap[item.accountId]
                  if (!account) return null
                  const owner = parentMap[account.ownerParentId]

                  return (
                    <div
                      key={item.accountId}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${account.type === 'credit-card' ? 'bg-rose-500/15' : 'bg-teal-500/15'}`}>
                          {account.type === 'credit-card' ? (
                            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{account.accountName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {account.bankName} •••• {account.last4}
                            {owner && ` · ${owner.name}`}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {formatCurrency(item.spent)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Expenses */}
            <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/30 dark:shadow-slate-900/30">
              <div className="flex items-center justify-between p-5 border-b border-slate-200/60 dark:border-slate-700/60">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Expenses</h2>
                <button
                  type="button"
                  onClick={onViewExpenses}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                {recentExpenses.map((expense) => {
                  const category = categoryMap[expense.categoryId]
                  const styles = category ? getColorStyles(category.color) : getColorStyles('teal')

                  return (
                    <button
                      key={expense.id}
                      type="button"
                      onClick={() => onViewExpense?.(expense.id)}
                      className="w-full text-left p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/70 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg ring-1 ${styles.ring} ${styles.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <span className={`text-xs font-bold ${styles.text}`}>
                              {category?.name.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                              {expense.description}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {category && ` · ${category.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {formatCurrency(expense.amount)}
                          </p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                            expense.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                            expense.status === 'pending_approval' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                            expense.status === 'reimbursed' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' :
                            expense.status === 'denied' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {expense.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}

                {recentExpenses.length === 0 && (
                  <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                    No expenses recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* Pending Approvals */}
            {pendingExpenses.length > 0 && (
              <div className="bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-sm rounded-2xl border border-amber-200/60 dark:border-amber-700/40 shadow-lg shadow-amber-200/20 dark:shadow-amber-900/20">
                <div className="p-5 border-b border-amber-200/60 dark:border-amber-700/40">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                      Needs Your Review
                    </h2>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {pendingExpenses.slice(0, 3).map((expense) => {
                    const creator = parentMap[expense.createdByParentId]
                    return (
                      <button
                        key={expense.id}
                        type="button"
                        onClick={() => onViewExpense?.(expense.id)}
                        className="w-full text-left p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-amber-200/50 dark:border-amber-700/30 hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                              {expense.description}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              From {creator?.name || 'Unknown'}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
