import type { Account, ExpensesAndFinancesProps, Parent, Statement } from '../../../../../types'
import { useMemo } from 'react'

type AccountsOverviewProps = Pick<
  ExpensesAndFinancesProps,
  'accounts' | 'parents' | 'statements' | 'csvMappingTemplates' | 'onAddBankAccount' | 'onAddCreditCard' | 'onUploadStatement'
>

const accountTypeLabel: Record<Account['type'], string> = {
  'bank-account': 'Bank account',
  'credit-card': 'Credit card',
}

const cardTypeLabel: Record<NonNullable<Account['cardType']>, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
}

export function AccountsOverview({
  accounts,
  parents,
  statements,
  csvMappingTemplates,
  onAddBankAccount,
  onAddCreditCard,
  onUploadStatement,
}: AccountsOverviewProps) {
  const parentsMap = useMemo(() => {
    const map: Record<string, Parent> = {}
    parents.forEach(parent => {
      map[parent.id] = parent
    })
    return map
  }, [parents])

  const statementCountByAccount = useMemo(() => {
    const map: Record<string, number> = {}
    statements.forEach(statement => {
      map[statement.accountId] = (map[statement.accountId] || 0) + 1
    })
    return map
  }, [statements])

  const templatesCountByAccount = useMemo(() => {
    const map: Record<string, number> = {}
    csvMappingTemplates.forEach(template => {
      map[template.accountId] = (map[template.accountId] || 0) + 1
    })
    return map
  }, [csvMappingTemplates])

  const handleAddBankAccount = () => {
    const sample: Account = {
      id: `acc-${Math.random().toString(36).slice(2, 7)}`,
      type: 'bank-account',
      bankName: 'New Bank',
      accountName: 'New Checking',
      last4: '0000',
      accountSubtype: 'checking',
      ownerParentId: parents[0]?.id ?? 'unknown',
    }
    onAddBankAccount?.(sample)
  }

  const handleAddCreditCard = () => {
    const sample: Account = {
      id: `acc-${Math.random().toString(36).slice(2, 7)}`,
      type: 'credit-card',
      bankName: 'New Card Issuer',
      accountName: 'Family Card',
      last4: '1111',
      cardType: 'visa',
      ownerParentId: parents[0]?.id ?? 'unknown',
    }
    onAddCreditCard?.(sample)
  }

  const handleUploadStatement = (accountId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const sample: Statement = {
      id: `stm-${Math.random().toString(36).slice(2, 7)}`,
      accountId,
      fileName: 'new-statement.csv',
      uploadedAt: today,
      periodStart: today,
      periodEnd: today,
    }
    onUploadStatement?.(sample)
  }

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-teal-600 dark:text-teal-400">Accounts</p>
              <h1 className="text-3xl font-semibold sm:text-4xl">Family finance accounts</h1>
              <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Track every bank account and card connected to the family. Statements, templates, and uploads stay tied to each account.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddBankAccount}
                className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:bg-teal-500"
              >
                Add bank account
              </button>
              <button
                onClick={handleAddCreditCard}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500/40"
              >
                Add credit card
              </button>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total accounts', value: accounts.length },
              { label: 'Uploaded statements', value: statements.length },
              { label: 'Mapping templates', value: csvMappingTemplates.length },
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

        <div className="grid gap-6 lg:grid-cols-2">
          {accounts.map(account => {
            const owner = parentsMap[account.ownerParentId]
            return (
              <article
                key={account.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] transition hover:-translate-y-1 dark:border-slate-800/70 dark:bg-slate-900"
              >
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <div className="absolute -top-12 right-0 h-40 w-40 rounded-full bg-teal-400/10 blur-2xl" />
                  <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-rose-400/10 blur-2xl" />
                </div>
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                        {accountTypeLabel[account.type]}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold">{account.accountName}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{account.bankName}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      •••• {account.last4}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      {account.type === 'credit-card' ? cardTypeLabel[account.cardType ?? 'visa'] : account.accountSubtype ?? 'standard'}
                    </span>
                    <span className="text-xs">Owner: {owner?.name ?? 'Unassigned'}</span>
                    <span className="text-xs">Statements: {statementCountByAccount[account.id] ?? 0}</span>
                    <span className="text-xs">Templates: {templatesCountByAccount[account.id] ?? 0}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleUploadStatement(account.id)}
                      className="rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-500"
                    >
                      Upload statement
                    </button>
                    <button
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-500 dark:border-slate-700 dark:text-slate-300"
                    >
                      View activity
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
