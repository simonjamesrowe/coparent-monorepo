interface CalendarHeaderProps {
  currentDate: Date
  viewMode: 'month' | 'week' | 'day'
  onViewChange: (view: 'month' | 'week' | 'day') => void
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onViewChange,
  onNavigate,
}: CalendarHeaderProps) {
  const formatTitle = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const month = months[currentDate.getMonth()]
    const year = currentDate.getFullYear()

    switch (viewMode) {
      case 'month':
        return `${month} ${year}`
      case 'week': {
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        const startMonth = months[startOfWeek.getMonth()].slice(0, 3)
        const endMonth = months[endOfWeek.getMonth()].slice(0, 3)

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startMonth} ${startOfWeek.getDate()} – ${endOfWeek.getDate()}, ${year}`
        }
        return `${startMonth} ${startOfWeek.getDate()} – ${endMonth} ${endOfWeek.getDate()}, ${year}`
      }
      case 'day': {
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return `${weekdays[currentDate.getDay()]}, ${month} ${currentDate.getDate()}`
      }
    }
  }

  const views: { id: 'month' | 'week' | 'day'; label: string }[] = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Navigation Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => onNavigate('today')}
          className="px-3 py-1.5 text-sm font-medium text-teal-700 dark:text-teal-400
                   bg-teal-50 dark:bg-teal-900/30 rounded-lg hover:bg-teal-100
                   dark:hover:bg-teal-900/50 transition-colors border border-teal-200/60
                   dark:border-teal-800/60"
        >
          Today
        </button>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => onNavigate('prev')}
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors
                     text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => onNavigate('next')}
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors
                     text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 ml-2">
          {formatTitle()}
        </h2>
      </div>

      {/* View Toggle */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${viewMode === view.id
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }
            `}
          >
            {view.label}
          </button>
        ))}
      </div>
    </div>
  )
}
