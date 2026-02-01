import type { Budget, ExpensesAndFinancesProps } from '../../../../../types'
import { useMemo, useState } from 'react'

type BudgetSetupProps = Pick<ExpensesAndFinancesProps, 'budgets' | 'categories' | 'onSetBudgetLimit'>

const formatCurrency = (value: number) => `$${value.toFixed(2)}`

export function BudgetSetup({ budgets, categories, onSetBudgetLimit }: BudgetSetupProps) {
  const months = useMemo(() => Array.from(new Set(budgets.map(budget => budget.month))), [budgets])
  const [selectedMonth, setSelectedMonth] = useState(months[0] ?? '2025-12')
  const [draftLimits, setDraftLimits] = useState<Record<string, number>>({})

  const categoryLookup = useMemo(() => {
    const map: Record<string, string> = {}
    categories.forEach(category => {
      map[category.id] = category.name
    })
    return map
  }, [categories])

  const monthBudgets = useMemo(
    () => budgets.filter(budget => budget.month === selectedMonth),
    [budgets, selectedMonth]
  )

  const handleSaveLimit = (budget: Budget) => {
    const draft = draftLimits[budget.categoryId]
    const limit = Number.isFinite(draft) ? draft : budget.limit
    onSetBudgetLimit?.(budget.categoryId, selectedMonth, limit)
  }

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800/70 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500 dark:text-rose-300">Budgets</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Set monthly budget limits</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Establish category limits and monitor current spend to stay aligned on family spending goals.
              </p>
            </div>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-rose-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {months.map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 border-b border-slate-200 pb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <span>Category</span>
            <span>Current spend</span>
            <span>Limit</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {monthBudgets.map(budget => (
              <div key={budget.id} className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center gap-3 py-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{categoryLookup[budget.categoryId]}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Status: {budget.status.replace('_', ' ')}</p>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300">{formatCurrency(budget.spent)}</span>
                <input
                  type="number"
                  min={0}
                  value={draftLimits[budget.categoryId] ?? budget.limit}
                  onChange={(event) =>
                    setDraftLimits(prev => ({
                      ...prev,
                      [budget.categoryId]: Number(event.target.value),
                    }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-rose-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
                <button
                  onClick={() => handleSaveLimit(budget)}
                  className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:bg-rose-400"
                >
                  Save limit
                </button>
              </div>
            ))}
            {!monthBudgets.length && (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No budgets set for this month yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
