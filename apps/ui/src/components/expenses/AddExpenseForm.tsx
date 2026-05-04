import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Child {
  id: string;
  name: string;
}

interface AddExpenseFormData {
  categoryId: string;
  amount: number;
  date: string;
  description: string;
  childId?: string | null;
  requiresApproval: boolean;
}

export interface AddExpenseFormProps {
  categories: Category[];
  children: Child[];
  onSubmit: (data: AddExpenseFormData) => void;
  onCancel: () => void;
}

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-teal-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500';

const labelClass =
  'block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1.5';

export function AddExpenseForm({ categories, children, onSubmit, onCancel }: AddExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [childId, setChildId] = useState<string>('');
  const [requiresApproval, setRequiresApproval] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !date || !categoryId) {
      return;
    }

    onSubmit({
      description: description.trim(),
      amount: parsedAmount,
      date,
      categoryId,
      childId: childId || null,
      requiresApproval,
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600 dark:text-teal-400">
        New expense
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Add a manual expense
      </h2>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="expense-description" className={labelClass}>
            Description
          </label>
          <input
            id="expense-description"
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. School supplies"
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="expense-amount" className={labelClass}>
              Amount
            </label>
            <input
              id="expense-amount"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="expense-date" className={labelClass}>
              Date
            </label>
            <input
              id="expense-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="expense-category" className={labelClass}>
              Category
            </label>
            <select
              id="expense-category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              {categories.length === 0 && (
                <option value="" disabled>
                  No categories available
                </option>
              )}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expense-child" className={labelClass}>
              Child
            </label>
            <select
              id="expense-child"
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className={inputClass}
            >
              <option value="">Shared</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <input
            id="expense-requires-approval"
            type="checkbox"
            checked={requiresApproval}
            onChange={(e) => setRequiresApproval(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-800"
          />
          <label
            htmlFor="expense-requires-approval"
            className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Requires approval from the other parent
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:bg-teal-500"
          >
            Add Expense
          </button>
        </div>
      </form>
    </div>
  );
}
