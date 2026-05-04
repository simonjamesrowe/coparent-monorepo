import { useState } from 'react';

import type { AccountSubtype, CardType } from '../../types/expenses';

interface Parent {
  id: string;
  name: string;
}

interface AddAccountFormData {
  type: 'bank-account' | 'credit-card';
  bankName: string;
  accountName: string;
  last4: string;
  ownerParentId: string;
  accountSubtype?: AccountSubtype;
  cardType?: CardType;
}

export interface AddAccountFormProps {
  type: 'bank-account' | 'credit-card';
  parents: Parent[];
  onSubmit: (data: AddAccountFormData) => void;
  onCancel: () => void;
}

export function AddAccountForm({ type, parents, onSubmit, onCancel }: AddAccountFormProps) {
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [last4, setLast4] = useState('');
  const [ownerParentId, setOwnerParentId] = useState(parents[0]?.id ?? '');
  const [accountSubtype, setAccountSubtype] = useState<AccountSubtype>('checking');
  const [cardType, setCardType] = useState<CardType>('visa');

  const isBankAccount = type === 'bank-account';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      bankName: bankName.trim(),
      accountName: accountName.trim(),
      last4,
      ownerParentId,
      ...(isBankAccount ? { accountSubtype } : { cardType }),
    });
  };

  const isValid =
    bankName.trim().length > 0 &&
    accountName.trim().length > 0 &&
    last4.length === 4 &&
    ownerParentId.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-slate-900/30">
      <div className="border-b border-slate-200/60 px-6 py-4 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isBankAccount
                ? 'bg-gradient-to-br from-teal-500 to-teal-600'
                : 'bg-gradient-to-br from-rose-500 to-rose-600'
            }`}
          >
            {isBankAccount ? (
              <svg
                className="h-5 w-5 text-white"
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
            ) : (
              <svg
                className="h-5 w-5 text-white"
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
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              New
            </p>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {isBankAccount ? 'Add Bank Account' : 'Add Credit Card'}
            </h3>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          {/* Bank / Institution Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-account-bank-name"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              {isBankAccount ? 'Bank Name' : 'Institution Name'}
            </label>
            <input
              id="add-account-bank-name"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder={isBankAccount ? 'e.g. Chase' : 'e.g. American Express'}
              autoComplete="organization"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
            />
          </div>

          {/* Account Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-account-name"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Account Name
            </label>
            <input
              id="add-account-name"
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder={isBankAccount ? 'e.g. Joint Checking' : 'e.g. Travel Rewards'}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
            />
          </div>

          {/* Last 4 Digits */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-account-last4"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Last 4 Digits
            </label>
            <input
              id="add-account-last4"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={last4}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setLast4(value.slice(0, 4));
              }}
              placeholder="1234"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
            />
          </div>

          {/* Owner */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-account-owner"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Owner
            </label>
            <select
              id="add-account-owner"
              value={ownerParentId}
              onChange={(e) => setOwnerParentId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
            >
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional: Account Subtype (bank) or Card Type (credit card) */}
          {isBankAccount ? (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="add-account-subtype"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Account Type
              </label>
              <select
                id="add-account-subtype"
                value={accountSubtype}
                onChange={(e) => setAccountSubtype(e.target.value as AccountSubtype)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="add-account-card-type"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Card Type
              </label>
              <select
                id="add-account-card-type"
                value={cardType}
                onChange={(e) => setCardType(e.target.value as CardType)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">Amex</option>
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200/60 px-6 py-4 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 ${
              isBankAccount
                ? 'bg-teal-600 shadow-teal-500/25 hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-500/30 disabled:bg-teal-300 disabled:shadow-none dark:disabled:bg-teal-800'
                : 'bg-rose-600 shadow-rose-500/25 hover:bg-rose-700 hover:shadow-xl hover:shadow-rose-500/30 disabled:bg-rose-300 disabled:shadow-none dark:disabled:bg-rose-800'
            } disabled:cursor-not-allowed`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {isBankAccount ? 'Add Bank Account' : 'Add Credit Card'}
          </button>
        </div>
      </form>
    </div>
  );
}
