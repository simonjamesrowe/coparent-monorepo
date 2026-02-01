import type { ExpensesAndFinancesProps, Expense, Statement, StatementLine } from '../../../../../types'
import { useMemo, useState } from 'react'

type ExpenseListProps = Pick<
  ExpensesAndFinancesProps,
  'expenses' | 'categories' | 'accounts' | 'children' | 'parents' | 'statements' | 'statementLines' | 'onViewExpense'
>

const formatCurrency = (value: number) => `$${value.toFixed(2)}`

const colorClassMap: Record<string, string> = {
  lime: 'bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-200',
  sky: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
  violet: 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
  cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-200',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200',
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/20 dark:text-fuchsia-200',
  stone: 'bg-stone-100 text-stone-800 dark:bg-stone-600/20 dark:text-stone-200',
}

const statusClassMap: Record<Expense['status'], string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  pending_approval: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
  approved: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-200',
  reimbursed: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
  denied: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
}

export function ExpenseList({
  expenses,
  categories,
  accounts,
  children,
  parents,
  statements,
  statementLines,
  onViewExpense,
}: ExpenseListProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [selectedAccountId, setSelectedAccountId] = useState('all')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [search, setSearch] = useState('')

  const categoryLookup = useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {}
    categories.forEach(category => {
      map[category.id] = { name: category.name, color: category.color }
    })
    return map
  }, [categories])

  const childLookup = useMemo(() => {
    const map: Record<string, string> = {}
    children.forEach(child => {
      map[child.id] = child.name
    })
    return map
  }, [children])

  const parentLookup = useMemo(() => {
    const map: Record<string, string> = {}
    parents.forEach(parent => {
      map[parent.id] = parent.name
    })
    return map
  }, [parents])

  const accountLookup = useMemo(() => {
    const map: Record<string, string> = {}
    accounts.forEach(account => {
      map[account.id] = account.accountName
    })
    return map
  }, [accounts])

  const statementLookup = useMemo(() => {
    const map: Record<string, Statement> = {}
    statements.forEach(statement => {
      map[statement.id] = statement
    })
    return map
  }, [statements])

  const statementLineLookup = useMemo(() => {
    const map: Record<string, StatementLine> = {}
    statementLines.forEach(line => {
      map[line.id] = line
    })
    return map
  }, [statementLines])

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (selectedCategoryId !== 'all' && expense.categoryId !== selectedCategoryId) return false

      if (selectedAccountId !== 'all') {
        const line = expense.sourceStatementLineId ? statementLineLookup[expense.sourceStatementLineId] : undefined
        const statement = line ? statementLookup[line.statementId] : undefined
        if (statement?.accountId !== selectedAccountId) return false
      }

      if (dateStart && expense.date < dateStart) return false
      if (dateEnd && expense.date > dateEnd) return false

      if (search) {
        const value = `${expense.description} ${childLookup[expense.childId ?? ''] ?? ''}`.toLowerCase()
        if (!value.includes(search.toLowerCase())) return false
      }

      return true
    })
  }, [
    expenses,
    selectedCategoryId,
    selectedAccountId,
    dateStart,
    dateEnd,
    search,
    statementLineLookup,
    statementLookup,
    childLookup,
  ])

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600 dark:text-teal-400">Expense list</p>
              <h1 className="mt-3 text-3xl font-semibold">Every expense, filtered your way</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Filter by account, category, or date range. Drill into specific child expenses and reimbursement status.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {filteredExpenses.length} expenses
            </div>
          </div>
          <div className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search description or child"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
            <select
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">All categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={selectedAccountId}
              onChange={(event) => setSelectedAccountId(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">All accounts</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.accountName}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateStart}
              onChange={(event) => setDateStart(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
            <input
              type="date"
              value={dateEnd}
              onChange={(event) => setDateEnd(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
        </header>

        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
          <div className="grid grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr_1fr] gap-3 border-b border-slate-200 pb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <span>Description</span>
            <span>Category</span>
            <span>Amount</span>
            <span>Child</span>
            <span>Status</span>
            <span>Account</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredExpenses.map(expense => {
              const category = categoryLookup[expense.categoryId]
              const accountName = (() => {
                if (!expense.sourceStatementLineId) return 'Manual'
                const line = statementLineLookup[expense.sourceStatementLineId]
                const statement = line ? statementLookup[line.statementId] : undefined
                return statement ? accountLookup[statement.accountId] : 'Statement'
              })()
              return (
                <button
                  key={expense.id}
                  onClick={() => onViewExpense?.(expense.id)}
                  className="grid grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr_1fr] items-center gap-3 py-4 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{expense.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{expense.date} • {parentLookup[expense.createdByParentId]}</p>
                  </div>
                  <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${colorClassMap[category?.color ?? 'stone']}`}>
                    {category?.name ?? 'Uncategorized'}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(expense.amount)}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{expense.childId ? childLookup[expense.childId] : 'Shared'}</span>
                  <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClassMap[expense.status]}`}>
                    {expense.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{accountName}</span>
                </button>
              )
            })}
            {!filteredExpenses.length && (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No expenses match those filters.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
