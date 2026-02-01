import type { ExpensesAndFinancesProps } from '../../../../../types'
import { useMemo } from 'react'

type FinanceDashboardProps = Pick<
  ExpensesAndFinancesProps,
  'dashboardSummary' | 'categories' | 'budgets' | 'accounts'
>

const formatCurrency = (value: number) => `$${value.toFixed(2)}`

export function FinanceDashboard({ dashboardSummary, categories, budgets, accounts }: FinanceDashboardProps) {
  const categoryLookup = useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {}
    categories.forEach(category => {
      map[category.id] = { name: category.name, color: category.color }
    })
    return map
  }, [categories])

  const budgetLookup = useMemo(() => {
    const map: Record<string, number | null> = {}
    budgets.forEach(budget => {
      map[`${budget.categoryId}-${budget.month}`] = budget.limit
    })
    return map
  }, [budgets])

  const accountLookup = useMemo(() => {
    const map: Record<string, string> = {}
    accounts.forEach(account => {
      map[account.id] = account.accountName
    })
    return map
  }, [accounts])

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.55)] dark:border-slate-800/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600 dark:text-teal-400">Dashboard</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Spending pulse</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                A quick pulse on where money goes, how budgets are tracking, and what reimbursements are outstanding.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {dashboardSummary.month}
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total spent', value: formatCurrency(dashboardSummary.totalSpent) },
              { label: 'Child expenses', value: formatCurrency(dashboardSummary.totalChildExpenses) },
              { label: 'Reimbursements due', value: formatCurrency(dashboardSummary.reimbursementsDue) },
            ].map(card => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{card.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{card.value}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Budget vs actual</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">{dashboardSummary.categoryBreakdown.length} categories</span>
            </div>
            <div className="mt-6 space-y-5">
              {dashboardSummary.categoryBreakdown.map(breakdown => {
                const category = categoryLookup[breakdown.categoryId]
                const limit = breakdown.budgetLimit ?? budgetLookup[`${breakdown.categoryId}-${dashboardSummary.month}`] ?? null
                const percent = limit ? Math.min(100, (breakdown.spent / limit) * 100) : 0
                return (
                  <div key={breakdown.categoryId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{category?.name ?? 'Category'}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatCurrency(breakdown.spent)} {limit ? `of ${formatCurrency(limit)}` : 'no limit'}
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 via-teal-400 to-rose-400"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
              <h2 className="text-xl font-semibold">Top accounts</h2>
              <div className="mt-4 space-y-4">
                {dashboardSummary.accountSpend.map(account => (
                  <div key={account.accountId} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{accountLookup[account.accountId] ?? 'Account'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Monthly spend</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      {formatCurrency(account.spent)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
              <h2 className="text-xl font-semibold">Budget health</h2>
              <div className="mt-4 space-y-3">
                {budgets.map(budget => (
                  <div key={budget.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{categoryLookup[budget.categoryId]?.name ?? 'Category'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{budget.month}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        budget.status === 'over'
                          ? ' bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200'
                          : budget.status === 'near_limit'
                          ? ' bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
                          : ' bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-200'
                      }`}
                    >
                      {budget.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
