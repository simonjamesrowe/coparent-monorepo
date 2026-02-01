import type {
  Family,
  Child,
  CategorySummary,
  RepositoryCategory,
} from '../types'
import { ChildCard } from './ChildCard'

export interface RepositoryDashboardProps {
  family: Family
  children: Child[]
  categorySummaries: CategorySummary[]
  onSelectChild?: (childId: string) => void
  onSelectCategory?: (childId: string, category: RepositoryCategory) => void
}

export function RepositoryDashboard({
  family,
  children,
  categorySummaries,
  onSelectChild,
  onSelectCategory,
}: RepositoryDashboardProps) {
  const totalDocuments = categorySummaries
    .filter((s) => s.category !== 'contacts')
    .reduce((sum, s) => sum + s.itemCount, 0)
  const totalContacts = categorySummaries
    .filter((s) => s.category === 'contacts')
    .reduce((sum, s) => sum + s.itemCount, 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Accent glow */}
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20">
                  <svg className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-teal-400">Information Repository</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{family.name}</h1>
              <p className="mt-2 text-slate-400">
                Centralized records for your family's important documents and contacts
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{totalDocuments}</p>
                <p className="text-sm text-slate-400">Documents</p>
              </div>
              <div className="h-12 w-px bg-slate-700" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{totalContacts}</p>
                <p className="text-sm text-slate-400">Contacts</p>
              </div>
              <div className="h-12 w-px bg-slate-700" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{children.length}</p>
                <p className="text-sm text-slate-400">Children</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Children Grid */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Children</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a child to view their records
          </p>
        </div>

        {children.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
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
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">No children yet</h3>
            <p className="text-slate-500 dark:text-slate-400">
              Add your first child to start organizing their important records.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                categorySummaries={categorySummaries}
                onSelect={() => onSelectChild?.(child.id)}
                onSelectCategory={(category) => onSelectCategory?.(child.id, category)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
