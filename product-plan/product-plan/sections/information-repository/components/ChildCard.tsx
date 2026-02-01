import type { Child, CategorySummary, RepositoryCategory } from '../types'

interface ChildCardProps {
  child: Child
  categorySummaries: CategorySummary[]
  onSelect?: () => void
  onSelectCategory?: (category: RepositoryCategory) => void
}

const categoryConfig: Record<RepositoryCategory, { label: string; icon: string; gradient: string }> = {
  medical: {
    label: 'Medical',
    icon: '🏥',
    gradient: 'from-rose-500/10 to-rose-500/5 dark:from-rose-500/20 dark:to-rose-500/10',
  },
  school: {
    label: 'School',
    icon: '📚',
    gradient: 'from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/10',
  },
  contacts: {
    label: 'Contacts',
    icon: '📞',
    gradient: 'from-teal-500/10 to-teal-500/5 dark:from-teal-500/20 dark:to-teal-500/10',
  },
}

function getAge(birthdate: string): number {
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function formatDate(dateString: string): string {
  if (!dateString) return 'No updates yet'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ChildCard({ child, categorySummaries, onSelect, onSelectCategory }: ChildCardProps) {
  const age = getAge(child.birthdate)
  const childSummaries = categorySummaries.filter((s) => s.childId === child.id)

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white
                 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50
                 dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-slate-900/50"
    >
      {/* Decorative gradient bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-rose-400" />

      {/* Header */}
      <button
        onClick={onSelect}
        className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
      >
        {/* Avatar */}
        <div
          className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full
                       bg-gradient-to-br from-teal-100 to-teal-50 text-2xl font-semibold text-teal-700
                       ring-2 ring-teal-200/50 dark:from-teal-800 dark:to-teal-900 dark:text-teal-200 dark:ring-teal-700/50"
        >
          {child.name.charAt(0)}
        </div>

        {/* Name & Age */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{child.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {age} years old
            <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
            Last updated {formatDate(child.categoryStats.lastUpdatedAt)}
          </p>
        </div>

        {/* Arrow indicator */}
        <svg
          className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 dark:text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Category Stats */}
      <div className="grid grid-cols-3 gap-px border-t border-slate-100 bg-slate-100 dark:border-slate-700 dark:bg-slate-700">
        {(['medical', 'school', 'contacts'] as RepositoryCategory[]).map((category) => {
          const config = categoryConfig[category]
          const summary = childSummaries.find((s) => s.category === category)
          const count = summary?.itemCount ?? 0

          return (
            <button
              key={category}
              onClick={() => onSelectCategory?.(category)}
              className={`flex flex-col items-center gap-1 bg-gradient-to-b p-4 transition-all
                         hover:scale-[1.02] active:scale-[0.98] ${config.gradient}
                         bg-white dark:bg-slate-800`}
            >
              <span className="text-xl" role="img" aria-label={config.label}>
                {config.icon}
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{count}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{config.label}</span>
            </button>
          )
        })}
      </div>
    </article>
  )
}
