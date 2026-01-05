import type { CalendarSchedulingProps, EventCategory } from '../types'
import { useMemo, useState } from 'react'

const COLOR_STYLES: Record<string, { ring: string; bg: string; text: string }> = {
  red: { ring: 'ring-red-200/70 dark:ring-red-900/40', bg: 'bg-red-500/10 dark:bg-red-500/15', text: 'text-red-600 dark:text-red-300' },
  amber: { ring: 'ring-amber-200/70 dark:ring-amber-900/40', bg: 'bg-amber-500/10 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-300' },
  green: { ring: 'ring-emerald-200/70 dark:ring-emerald-900/40', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-300' },
  emerald: { ring: 'ring-emerald-200/70 dark:ring-emerald-900/40', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-300' },
  pink: { ring: 'ring-rose-200/70 dark:ring-rose-900/40', bg: 'bg-rose-500/10 dark:bg-rose-500/15', text: 'text-rose-600 dark:text-rose-300' },
  indigo: { ring: 'ring-indigo-200/70 dark:ring-indigo-900/40', bg: 'bg-indigo-500/10 dark:bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-300' },
  violet: { ring: 'ring-violet-200/70 dark:ring-violet-900/40', bg: 'bg-violet-500/10 dark:bg-violet-500/15', text: 'text-violet-600 dark:text-violet-300' },
  teal: { ring: 'ring-teal-200/70 dark:ring-teal-900/40', bg: 'bg-teal-500/10 dark:bg-teal-500/15', text: 'text-teal-600 dark:text-teal-300' },
}

function getCategoryStyles(category: EventCategory) {
  if (category.isSystem) {
    return {
      ring: 'ring-slate-200/80 dark:ring-slate-700/60',
      bg: 'bg-slate-500/10 dark:bg-slate-500/15',
      text: 'text-slate-600 dark:text-slate-300',
    }
  }
  if (category.color && COLOR_STYLES[category.color]) {
    return COLOR_STYLES[category.color]
  }
  return {
    ring: 'ring-teal-200/70 dark:ring-teal-900/40',
    bg: 'bg-teal-500/10 dark:bg-teal-500/15',
    text: 'text-teal-600 dark:text-teal-300',
  }
}

function getCategoryInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function CategoryManagement({
  events,
  eventCategories,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onViewEvent,
}: CalendarSchedulingProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'custom'>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(eventCategories[0]?.id || '')

  const categoryUsage = useMemo(() => {
    const usage: Record<string, number> = {}
    events.forEach(event => {
      usage[event.categoryId] = (usage[event.categoryId] || 0) + 1
    })
    return usage
  }, [events])

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase()
    return eventCategories.filter(category => {
      if (activeTab === 'custom' && category.isDefault) return false
      if (!query) return true
      return category.name.toLowerCase().includes(query)
    })
  }, [eventCategories, search, activeTab])

  const selectedCategory = eventCategories.find(category => category.id === selectedId)
  const upcomingEvents = useMemo(() => {
    if (!selectedCategory) return []
    return events
      .filter(event => event.categoryId === selectedCategory.id)
      .slice(0, 4)
  }, [events, selectedCategory])

  const totalCustom = eventCategories.filter(category => !category.isDefault).length
  const systemCount = eventCategories.filter(category => category.isSystem).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      <div
        className="fixed inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Calendar Settings
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
              Manage Event Categories
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Organize activities, medical visits, and custody blocks with clear labels and colors. Custom categories stay private to your family.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCreateCategory}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Category
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total categories', value: eventCategories.length },
            { label: 'Custom', value: totalCustom },
            { label: 'System defaults', value: systemCount },
            { label: 'Events tagged', value: events.length },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/60">
            <div className="p-5 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2 mb-3">
                {(['all', 'custom'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border transition ${
                      activeTab === tab
                        ? 'bg-teal-600 text-white border-teal-500 shadow shadow-teal-500/20'
                        : 'bg-white/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {tab === 'all' ? 'All categories' : 'Custom only'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search categories"
                  className="w-full rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
                <svg className="absolute right-3 top-3 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
                  <circle cx="11" cy="11" r="7" />
                </svg>
              </div>
            </div>

            <div className="p-3 space-y-2 max-h-[520px] overflow-y-auto">
              {filteredCategories.map(category => {
                const usage = categoryUsage[category.id] || 0
                const styles = getCategoryStyles(category)
                const isSelected = category.id === selectedId
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedId(category.id)}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      isSelected
                        ? 'border-teal-500/70 bg-teal-500/10 dark:bg-teal-500/15'
                        : 'border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 hover:border-slate-300/80 dark:hover:border-slate-600/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl ring-1 ${styles.ring} ${styles.bg} flex items-center justify-center`}>
                          <span className={`text-xs font-semibold ${styles.text}`}>
                            {getCategoryInitials(category.name)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {category.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {category.isSystem ? 'System category' : category.isDefault ? 'Default' : 'Custom'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{usage}</p>
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">events</p>
                      </div>
                    </div>
                  </button>
                )
              })}

              {filteredCategories.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-slate-400">
                  No categories match your search.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/60 p-6">
            {selectedCategory ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-2xl ring-1 ${getCategoryStyles(selectedCategory).ring} ${getCategoryStyles(selectedCategory).bg} flex items-center justify-center`}>
                      <span className={`text-sm font-semibold ${getCategoryStyles(selectedCategory).text}`}>
                        {getCategoryInitials(selectedCategory.name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Selected category</p>
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                        {selectedCategory.name}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Icon keyword: {selectedCategory.icon}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditCategory?.(selectedCategory.id)}
                      disabled={selectedCategory.isSystem}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCategory?.(selectedCategory.id)}
                      disabled={selectedCategory.isSystem}
                      className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-700 text-sm text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 bg-slate-50/70 dark:bg-slate-800/60">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Visibility</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {selectedCategory.isSystem ? 'Locked' : 'Custom'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {selectedCategory.isSystem ? 'Managed by the system.' : 'Visible to both parents.'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 bg-slate-50/70 dark:bg-slate-800/60">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Usage</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {categoryUsage[selectedCategory.id] || 0} events tagged
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Tracks upcoming and past events.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 bg-slate-50/70 dark:bg-slate-800/60">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Color</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {selectedCategory.color ? selectedCategory.color : 'Neutral'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${getCategoryStyles(selectedCategory).bg}`} />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Calendar highlight</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Upcoming events</h3>
                    <span className="text-xs text-slate-400">Showing {upcomingEvents.length}</span>
                  </div>
                  <div className="space-y-2">
                    {upcomingEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{event.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {event.startDate} {event.startTime ? `· ${event.startTime}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onViewEvent?.(event.id)}
                          className="text-xs font-semibold text-teal-600 dark:text-teal-300"
                        >
                          View
                        </button>
                      </div>
                    ))}

                    {upcomingEvents.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-200/70 dark:border-slate-700/70 p-6 text-center text-sm text-slate-400">
                        No events tagged yet. Add one from the calendar.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-slate-400">Select a category to see details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
