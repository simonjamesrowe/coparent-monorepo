import type { ExpensesAndFinancesProps, StatementLine } from '../../../../../types'
import { useMemo, useState } from 'react'

type StatementLineReviewProps = Pick<
  ExpensesAndFinancesProps,
  'statements' | 'statementLines' | 'accounts' | 'onMarkLineAsChildExpense'
>

const formatCurrency = (value: number) => `$${value.toFixed(2)}`

export function StatementLineReview({
  statements,
  statementLines,
  accounts,
  categories,
  onMarkLineAsChildExpense,
}: StatementLineReviewProps) {
  const [selectedStatementId, setSelectedStatementId] = useState(statements[0]?.id ?? '')
  const [approvalOverrides, setApprovalOverrides] = useState<Record<string, boolean>>({})

  const statementLookup = useMemo(() => {
    const map: Record<string, string> = {}
    statements.forEach(statement => {
      const account = accounts.find(acc => acc.id === statement.accountId)
      map[statement.id] = `${account?.accountName ?? 'Account'} • ${statement.fileName}`
    })
    return map
  }, [statements, accounts])

  const lines = useMemo(
    () => statementLines.filter(line => line.statementId === selectedStatementId),
    [statementLines, selectedStatementId]
  )

  const handleToggleChildExpense = (line: StatementLine) => {
    const requiresApproval = approvalOverrides[line.id] ?? line.requiresApproval
    onMarkLineAsChildExpense?.(line.id, requiresApproval)
  }

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800/70 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500 dark:text-rose-300">Statement review</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Mark child expenses</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Quickly scan statement lines, tag child-related expenses, and flag approvals when required.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedStatementId}
                onChange={(event) => setSelectedStatementId(event.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-rose-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {statements.map(statement => (
                  <option key={statement.id} value={statement.id}>
                    {statementLookup[statement.id]}
                  </option>
                ))}
              </select>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {lines.length} lines
              </span>
            </div>
          </div>
        </header>

        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
          <div className="grid grid-cols-[1.4fr_2fr_1fr_1fr_1fr] gap-3 border-b border-slate-200 pb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <span>Date</span>
            <span>Merchant</span>
            <span>Amount</span>
            <span>Child expense</span>
            <span>Approval</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lines.map(line => {
              const requiresApproval = approvalOverrides[line.id] ?? line.requiresApproval
              return (
                <div key={line.id} className="grid grid-cols-[1.4fr_2fr_1fr_1fr_1fr] items-center gap-3 py-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{line.date}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{line.categoryGuess}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{line.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Suggested: {line.categoryGuess}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {formatCurrency(line.amount)}
                  </span>
                  <button
                    onClick={() => handleToggleChildExpense(line)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      line.isChildExpense
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                        : 'border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {line.isChildExpense ? 'Marked' : 'Mark'}
                  </button>
                  <button
                    onClick={() =>
                      setApprovalOverrides(prev => ({
                        ...prev,
                        [line.id]: !(prev[line.id] ?? line.requiresApproval),
                      }))
                    }
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      requiresApproval
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : 'border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {requiresApproval ? 'Approval' : 'No approval'}
                  </button>
                </div>
              )
            })}
            {!lines.length && (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No statement lines to review yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
