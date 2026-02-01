import type { Category, ExpensesAndFinancesProps } from '../../../../../types'
import { useState } from 'react'

type CategoryManagementProps = Pick<ExpensesAndFinancesProps, 'categories' | 'onAddCategory'>

const colorOptions = ['lime', 'sky', 'amber', 'violet', 'rose', 'cyan', 'orange', 'emerald', 'fuchsia', 'stone']

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

export function CategoryManagement({ categories, onAddCategory }: CategoryManagementProps) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('lime')

  const handleAddCategory = () => {
    if (!newName.trim()) return
    const category: Category = {
      id: `cat-${Math.random().toString(36).slice(2, 7)}`,
      name: newName.trim(),
      type: 'custom',
      color: newColor,
    }
    onAddCategory?.(category)
    setNewName('')
  }

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800/70 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600 dark:text-teal-400">Categories</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Organize spending categories</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Standardize how expenses roll up into the family budget. Add custom categories to cover unique needs.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {categories.length} categories
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">All categories</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Predefined + custom</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{category.type === 'custom' ? 'Custom' : 'Predefined'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colorClassMap[category.color] ?? colorClassMap.stone}`}>
                    {category.color}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
            <h2 className="text-xl font-semibold">Add custom category</h2>
            <div className="mt-4 space-y-3">
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Category name"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      newColor === color ? 'border border-teal-400 text-teal-600 dark:text-teal-300' : 'border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddCategory}
                className="w-full rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:bg-teal-500"
              >
                Add category
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
