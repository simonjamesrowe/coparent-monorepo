import type { Event, Parent, EventCategory } from '../types'
import { useMemo } from 'react'
import { EventPill } from './EventPill'

interface MonthViewProps {
  currentDate: Date
  events: Event[]
  parents: Record<string, Parent>
  eventCategories: EventCategory[]
  onDayClick: (date: Date) => void
  onEventClick?: (eventId: string) => void
}

interface DayData {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  custodyParent: Parent | null
  events: Event[]
}

export function MonthView({
  currentDate,
  events,
  parents,
  eventCategories,
  onDayClick,
  onEventClick,
}: MonthViewProps) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Start from Sunday of the first week
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    // End on Saturday of the last week
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

    const days: DayData[] = []
    const current = new Date(startDate)
    const today = new Date(2025, 0, 6) // Sample "today" for demo

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0]

      // Find custody parent for this day
      const custodyEvent = events.find(e => {
        if (e.type !== 'custody') return false
        const start = new Date(e.startDate)
        const end = e.endDate ? new Date(e.endDate) : start
        return current >= start && current < end
      })

      // Find non-custody events for this day
      const dayEvents = events.filter(e => {
        if (e.type === 'custody') return false
        return e.startDate === dateStr
      })

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.getTime() === today.getTime(),
        custodyParent: custodyEvent?.parentId ? parents[custodyEvent.parentId] : null,
        events: dayEvents,
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentDate, events, parents])

  const getCustodyGradient = (parent: Parent | null, position: 'start' | 'middle' | 'end' | 'single') => {
    if (!parent) return ''

    const colors = parent.color === 'violet'
      ? { bg: 'bg-violet-100 dark:bg-violet-900/30', border: 'border-violet-200 dark:border-violet-800' }
      : { bg: 'bg-sky-100 dark:bg-sky-900/30', border: 'border-sky-200 dark:border-sky-800' }

    let roundedClass = ''
    switch (position) {
      case 'start':
        roundedClass = 'rounded-l-xl'
        break
      case 'end':
        roundedClass = 'rounded-r-xl'
        break
      case 'single':
        roundedClass = 'rounded-xl'
        break
      default:
        roundedClass = ''
    }

    return `${colors.bg} ${roundedClass}`
  }

  // Determine custody block position for each day
  const getCustodyPosition = (dayIndex: number): 'start' | 'middle' | 'end' | 'single' | null => {
    const day = calendarDays[dayIndex]
    if (!day.custodyParent) return null

    const prevDay = calendarDays[dayIndex - 1]
    const nextDay = calendarDays[dayIndex + 1]

    const hasPrev = prevDay?.custodyParent?.id === day.custodyParent.id
    const hasNext = nextDay?.custodyParent?.id === day.custodyParent.id

    if (!hasPrev && !hasNext) return 'single'
    if (!hasPrev && hasNext) return 'start'
    if (hasPrev && hasNext) return 'middle'
    if (hasPrev && !hasNext) return 'end'
    return null
  }

  return (
    <div className="p-2 sm:p-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400
                     uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {calendarDays.map((day, index) => {
          const custodyPosition = getCustodyPosition(index)
          const isWeekStart = index % 7 === 0
          const isWeekEnd = index % 7 === 6

          return (
            <div
              key={day.date.toISOString()}
              onClick={() => onDayClick(day.date)}
              className={`
                relative min-h-[80px] sm:min-h-[100px] p-1 cursor-pointer
                transition-all duration-150
                ${!day.isCurrentMonth ? 'opacity-40' : ''}
                ${day.isToday ? 'ring-2 ring-teal-500 ring-inset rounded-xl z-10' : ''}
                hover:bg-slate-50 dark:hover:bg-slate-700/30
                ${custodyPosition ? getCustodyGradient(day.custodyParent, custodyPosition) : ''}
              `}
            >
              {/* Day number */}
              <div className={`
                flex items-center justify-center w-7 h-7 text-sm font-medium
                ${day.isToday
                  ? 'bg-teal-600 text-white rounded-full'
                  : day.isCurrentMonth
                    ? 'text-slate-700 dark:text-slate-200'
                    : 'text-slate-400 dark:text-slate-500'
                }
              `}>
                {day.date.getDate()}
              </div>

              {/* Custody indicator dot */}
              {day.custodyParent && custodyPosition === 'start' && (
                <div className="absolute top-1 right-1">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {day.custodyParent.name}
                  </span>
                </div>
              )}

              {/* Events */}
              <div className="mt-1 space-y-0.5 overflow-hidden">
                {day.events.slice(0, 2).map((event) => (
                  <EventPill
                    key={event.id}
                    event={event}
                    eventCategories={eventCategories}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(event.id)
                    }}
                    compact
                  />
                ))}
                {day.events.length > 2 && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pl-1">
                    +{day.events.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
