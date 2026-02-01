import type {
  CsvMappingTemplate,
  ExpensesAndFinancesProps,
  Statement,
  StatementLine,
} from '../../../../../types'
import { useMemo, useState } from 'react'

type CsvUploadMappingProps = Pick<
  ExpensesAndFinancesProps,
  'accounts' | 'statements' | 'statementLines' | 'csvMappingTemplates' | 'onUploadStatement' | 'onSaveMappingTemplate'
>

const mappingFields = [
  { key: 'dateColumn', label: 'Date' },
  { key: 'descriptionColumn', label: 'Description' },
  { key: 'amountColumn', label: 'Amount' },
  { key: 'categoryColumn', label: 'Category' },
] as const

export function CsvUploadMapping({
  accounts,
  statements,
  statementLines,
  csvMappingTemplates,
  onUploadStatement,
  onSaveMappingTemplate,
}: CsvUploadMappingProps) {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id ?? '')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const accountStatements = useMemo(() => statements.filter(s => s.accountId === selectedAccountId), [statements, selectedAccountId])

  const latestStatement = useMemo(() => {
    const sorted = [...accountStatements].sort((a, b) => (a.uploadedAt > b.uploadedAt ? -1 : 1))
    return sorted[0]
  }, [accountStatements])

  const templates = useMemo(
    () => csvMappingTemplates.filter(template => template.accountId === selectedAccountId),
    [csvMappingTemplates, selectedAccountId]
  )

  const activeTemplate = useMemo(() => {
    if (!templates.length) return null
    const match = templates.find(template => template.id === selectedTemplateId)
    return match ?? templates[0]
  }, [templates, selectedTemplateId])

  const previewLines: StatementLine[] = useMemo(() => {
    if (!latestStatement) return []
    return statementLines.filter(line => line.statementId === latestStatement.id).slice(0, 4)
  }, [statementLines, latestStatement])

  const availableColumns = useMemo(() => {
    if (activeTemplate) {
      return Object.values(activeTemplate.mappings)
    }
    return ['Date', 'Description', 'Amount', 'Category', 'Notes']
  }, [activeTemplate])

  const handleUpload = () => {
    const today = new Date().toISOString().split('T')[0]
    const statement: Statement = {
      id: `stm-${Math.random().toString(36).slice(2, 7)}`,
      accountId: selectedAccountId,
      fileName: 'new-upload.csv',
      uploadedAt: today,
      periodStart: today,
      periodEnd: today,
    }
    onUploadStatement?.(statement)
  }

  const handleSaveTemplate = () => {
    const template: CsvMappingTemplate = {
      id: `map-${Math.random().toString(36).slice(2, 7)}`,
      accountId: selectedAccountId,
      name: 'New mapping template',
      mappings: {
        dateColumn: availableColumns[0] ?? 'Date',
        descriptionColumn: availableColumns[1] ?? 'Description',
        amountColumn: availableColumns[2] ?? 'Amount',
        categoryColumn: availableColumns[3] ?? 'Category',
      },
      delimiter: ',',
      hasHeaderRow: true,
      createdAt: new Date().toISOString().split('T')[0],
    }
    onSaveMappingTemplate?.(template)
  }

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)] dark:border-slate-800/70 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600 dark:text-teal-400">Statement upload</p>
              <h1 className="mt-3 text-3xl font-semibold">Map CSV columns once, reuse forever</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Upload a statement, align the columns with our expense fields, and save the mapping template for this account.
              </p>
            </div>
            <button
              onClick={handleUpload}
              className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:-translate-y-0.5 hover:bg-teal-500"
            >
              Upload new statement
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Accounts</h2>
              <div className="mt-4 space-y-3">
                {accounts.map(account => (
                  <button
                    key={account.id}
                    onClick={() => setSelectedAccountId(account.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      selectedAccountId === account.id
                        ? 'border-teal-500/40 bg-teal-50 text-teal-700 dark:border-teal-400/40 dark:bg-teal-500/10 dark:text-teal-200'
                        : 'border-slate-200/70 bg-white text-slate-600 hover:border-teal-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    <p className="text-sm font-semibold">{account.accountName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{account.bankName} •••• {account.last4}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Templates</h2>
                <button
                  onClick={handleSaveTemplate}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-500 dark:border-slate-700 dark:text-slate-300"
                >
                  Save template
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {templates.length ? (
                  templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        activeTemplate?.id === template.id
                          ? 'border-rose-500/40 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200'
                          : 'border-slate-200/70 bg-white text-slate-600 hover:border-rose-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <p className="font-semibold">{template.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Saved {template.createdAt}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No templates yet. Upload a statement to create one.</p>
                )}
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Column mapping</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Assign each required field to a column from your CSV.</p>
                </div>
                {latestStatement && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Latest statement: {latestStatement.fileName}
                  </div>
                )}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {mappingFields.map(field => (
                  <label key={field.key} className="space-y-2 text-sm">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                      {field.label}
                    </span>
                    <select
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      defaultValue={activeTemplate?.mappings[field.key] ?? availableColumns[0]}
                    >
                      {availableColumns.map(column => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Preview rows</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">Showing {previewLines.length} rows</span>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  <span>Date</span>
                  <span>Description</span>
                  <span>Amount</span>
                  <span>Category</span>
                </div>
                {previewLines.length ? (
                  previewLines.map(line => (
                    <div
                      key={line.id}
                      className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-2 border-b border-slate-100 px-4 py-3 text-sm text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-200"
                    >
                      <span>{line.date}</span>
                      <span className="line-clamp-1">{line.description}</span>
                      <span>${line.amount.toFixed(2)}</span>
                      <span>{line.categoryGuess}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">No statement lines available yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
