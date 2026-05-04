import { useMemo, useState } from 'react';

import type { Account, Statement, CsvMappingTemplate } from '../../types/expenses';

interface Parent {
  id: string;
  name: string;
}

const CARD_TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  visa: { icon: 'V', color: 'bg-blue-600' },
  mastercard: { icon: 'M', color: 'bg-orange-600' },
  amex: { icon: 'A', color: 'bg-slate-600' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export interface AccountListProps {
  accounts: Account[];
  statements: Statement[];
  parents: Parent[];
  csvMappingTemplates: CsvMappingTemplate[];
  onAddBankAccount?: () => void;
  onAddCreditCard?: () => void;
  onViewAccount?: (accountId: string) => void;
  onEditAccount?: (accountId: string) => void;
  onDeleteAccount?: (accountId: string) => void;
  onUploadStatement?: (accountId: string) => void;
  onViewStatement?: (statementId: string) => void;
}

type FilterType = 'all' | 'bank-account' | 'credit-card';

export function AccountList({
  accounts,
  statements,
  parents,
  csvMappingTemplates,
  onAddBankAccount,
  onAddCreditCard,
  onViewAccount: _onViewAccount,
  onEditAccount,
  onDeleteAccount,
  onUploadStatement,
  onViewStatement,
}: AccountListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    accounts[0]?.id || null,
  );

  const parentMap = useMemo(() => {
    const map: Record<string, Parent> = {};
    parents.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [parents]);

  const filteredAccounts = useMemo(() => {
    if (filter === 'all') return accounts;
    return accounts.filter((acc) => acc.type === filter);
  }, [accounts, filter]);

  const bankAccountCount = accounts.filter((a) => a.type === 'bank-account').length;
  const creditCardCount = accounts.filter((a) => a.type === 'credit-card').length;

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedAccountStatements = useMemo(() => {
    if (!selectedAccountId) return [];
    return statements
      .filter((s) => s.accountId === selectedAccountId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [statements, selectedAccountId]);

  const selectedAccountTemplates = useMemo(() => {
    if (!selectedAccountId) return [];
    return csvMappingTemplates.filter((t) => t.accountId === selectedAccountId);
  }, [csvMappingTemplates, selectedAccountId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015] dark:opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
              Expenses & Finances
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl dark:text-slate-100">
              Accounts & Cards
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage bank accounts and credit cards for expense tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onAddBankAccount}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <svg
                className="h-4 w-4 text-teal-600 dark:text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
                />
              </svg>
              Add Bank Account
            </button>
            <button
              type="button"
              onClick={onAddCreditCard}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-teal-500/25 transition-all duration-200 hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-500/30"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                />
              </svg>
              Add Credit Card
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-lg shadow-slate-200/30 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-slate-900/30">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Total Accounts
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">
              {accounts.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-lg shadow-slate-200/30 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-slate-900/30">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Bank Accounts
            </p>
            <p className="mt-2 text-3xl font-bold text-teal-600 dark:text-teal-400">
              {bankAccountCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-lg shadow-slate-200/30 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-slate-900/30">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Credit Cards
            </p>
            <p className="mt-2 text-3xl font-bold text-rose-600 dark:text-rose-400">
              {creditCardCount}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Account List */}
          <div className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-slate-900/30">
            {/* Filter Tabs */}
            <div className="border-b border-slate-200/60 p-4 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                {(['all', 'bank-account', 'credit-card'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilter(type)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                      filter === type
                        ? 'border-teal-500 bg-teal-600 text-white shadow shadow-teal-500/20'
                        : 'border-slate-200/60 bg-white/70 text-slate-500 hover:border-slate-300 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    {type === 'all' ? 'All' : type === 'bank-account' ? 'Banks' : 'Cards'}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Cards */}
            <div className="max-h-[600px] space-y-2 overflow-y-auto p-3">
              {filteredAccounts.map((account) => {
                const owner = parentMap[account.ownerParentId];
                const isSelected = account.id === selectedAccountId;
                const cardType = account.cardType ? CARD_TYPE_ICONS[account.cardType] : null;

                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setSelectedAccountId(account.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-teal-500/70 bg-teal-500/10 shadow-lg shadow-teal-500/10 dark:bg-teal-500/15'
                        : 'border-slate-200/60 bg-white/70 hover:border-slate-300/80 dark:border-slate-700/60 dark:bg-slate-900/60 dark:hover:border-slate-600/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                          account.type === 'credit-card'
                            ? cardType?.color || 'bg-rose-500'
                            : 'bg-gradient-to-br from-teal-500 to-teal-600'
                        }`}
                      >
                        {account.type === 'credit-card' ? (
                          <span className="text-lg font-bold text-white">
                            {cardType?.icon || 'C'}
                          </span>
                        ) : (
                          <svg
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {account.accountName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {account.bankName} •••• {account.last4}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              account.type === 'credit-card'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                            }`}
                          >
                            {account.type === 'credit-card'
                              ? account.cardType?.toUpperCase()
                              : account.accountSubtype}
                          </span>
                          {owner && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {owner.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredAccounts.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  No{' '}
                  {filter === 'all'
                    ? 'accounts'
                    : filter === 'bank-account'
                      ? 'bank accounts'
                      : 'credit cards'}{' '}
                  found
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-6">
            {selectedAccount ? (
              <>
                {/* Account Info Card */}
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-lg shadow-slate-200/30 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-slate-900/30">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                          selectedAccount.type === 'credit-card'
                            ? CARD_TYPE_ICONS[selectedAccount.cardType || '']?.color ||
                              'bg-rose-500'
                            : 'bg-gradient-to-br from-teal-500 to-teal-600'
                        }`}
                      >
                        {selectedAccount.type === 'credit-card' ? (
                          <span className="text-xl font-bold text-white">
                            {CARD_TYPE_ICONS[selectedAccount.cardType || '']?.icon || 'C'}
                          </span>
                        ) : (
                          <svg
                            className="h-7 w-7 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                          {selectedAccount.type === 'credit-card' ? 'Credit Card' : 'Bank Account'}
                        </p>
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                          {selectedAccount.accountName}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {selectedAccount.bankName} •••• {selectedAccount.last4}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUploadStatement?.(selectedAccount.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
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
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        Upload Statement
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditAccount?.(selectedAccount.id)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                        title="Edit"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteAccount?.(selectedAccount.id)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                        title="Delete"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200/50 bg-slate-50/70 p-4 dark:border-slate-700/50 dark:bg-slate-900/50">
                      <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Owner
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {parentMap[selectedAccount.ownerParentId]?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/50 bg-slate-50/70 p-4 dark:border-slate-700/50 dark:bg-slate-900/50">
                      <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Statements
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {selectedAccountStatements.length} uploaded
                      </p>
                    </div>
                  </div>
                </div>

                {/* CSV Mapping Templates */}
                {selectedAccountTemplates.length > 0 && (
                  <div className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-slate-900/30">
                    <div className="border-b border-slate-200/60 p-5 dark:border-slate-700/60">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        CSV Templates
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Saved column mappings for statement uploads
                      </p>
                    </div>
                    <div className="space-y-2 p-4">
                      {selectedAccountTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/70 p-4 dark:border-slate-700/50 dark:bg-slate-900/50"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {template.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Created {formatDate(template.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                              {template.delimiter === ',' ? 'CSV' : 'TSV'}
                            </span>
                            {template.hasHeaderRow && (
                              <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                                Header
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statements */}
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-slate-900/30">
                  <div className="border-b border-slate-200/60 p-5 dark:border-slate-700/60">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      Uploaded Statements
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                    {selectedAccountStatements.map((statement) => (
                      <button
                        key={statement.id}
                        type="button"
                        onClick={() => onViewStatement?.(statement.id)}
                        className="w-full p-4 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/70"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                              <svg
                                className="h-5 w-5 text-slate-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {statement.fileName}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {formatDate(statement.periodStart)} –{' '}
                                {formatDate(statement.periodEnd)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              Uploaded {formatDate(statement.uploadedAt)}
                            </p>
                            {statement.mappingTemplateId ? (
                              <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                Mapped
                              </span>
                            ) : (
                              <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                Needs mapping
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}

                    {selectedAccountStatements.length === 0 && (
                      <div className="p-8 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                          <svg
                            className="h-6 w-6 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No statements uploaded yet
                        </p>
                        <button
                          type="button"
                          onClick={() => onUploadStatement?.(selectedAccount.id)}
                          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
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
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                            />
                          </svg>
                          Upload Statement
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-12 text-center shadow-lg shadow-slate-200/30 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-slate-900/30">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <svg
                    className="h-8 w-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Select an account
                </p>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                  Choose an account from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
