import type { Event, Parent, EventCategory } from '../types'
import { useMemo } from 'react'
import { EventPill } from './EventPill'

interface WeekViewProps {
  currentDate: Date
  events: Event[]
  parents: Record<string, Parent>
  eventCategories: EventCategory[]
  onDayClick: (date: Date) => void
  onEventClick?: (eventId: string) => void
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM to 8 PM

export function WeekView({
  currentDate,
  events,
  parents,
  eventCategories,
  onDayClick,
  onEventClick,
}: WeekViewProps) {
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }
    return days
  }, [currentDate])

  const today = new Date(2025, 0, 6) // Sample "today"

  const formatHour = (hour: number) => {
    if (hour === 12) return '12 PM'
    if (hour > 12) return `${hour - 12} PM`
    return `${hour} AM`
  }

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.startDate === dateStr && e.type !== 'custody')
  }

  const getCustodyForDay = (date: Date) => {
    return events.find(e => {
      if (e.type !== 'custody') return false
      const start = new Date(e.startDate)
      const end = e.endDate ? new Date(e.endDate) : start
      return date >= start && date < end
    })
  }

  const getEventPosition = (event: Event) => {
    if (!event.startTime) return null

    const [startHour, startMin] = event.startTime.split(':').map(Number)
    const [endHour, endMin] = event.endTime
      ? event.endTime.split(':').map(Number)
      : [startHour + 1, startMin]

    const top = ((startHour - 7) * 60 + startMin) / 60 * 64 // 64px per hour
    const height = ((endHour - startHour) * 60 + (endMin - startMin)) / 60 * 64

    return { top, height: Math.max(height, 24) }
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="overflow-x-auto">
      {/* Header with days */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          <div className="p-2" /> {/* Empty corner */}
          {weekDays.map((date, i) => {
            const custodyEvent = getCustodyForDay(date)
            const custodyParent = custodyEvent?.parentId ? parents[custodyEvent.parentId] : null
            const isToday = date.getTime() === today.getTime()

            return (
              <div
                key={date.toISOString()}
                onClick={() => onDayClick(date)}
                className={`
                  p-3 text-center cursor-pointer transition-colors
                  hover:bg-slate-50 dark:hover:bg-slate-700/50
                  ${i < 6 ? 'border-r border-slate-200 dark:border-slate-700' : ''}
                `}
              >
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  {dayNames[date.getDay()]}
                </div>
                <div className={`
                  mt-1 w-10 h-10 mx-auto flex items-center justify-center text-lg font-semibold
                  ${isToday
                    ? 'bg-teal-600 text-white rounded-full'
                    : 'text-slate-800 dark:text-slate-100'
                  }
                `}>
                  {date.getDate()}
                </div>
                {custodyParent && (
                  <div className={`
                    mt-2 py-1 px-2 rounded-full text-[10px] font-medium inline-block
                    ${custodyParent.color === 'violet'
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                      : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                    }
                  `}>
                    {custodyParent.name}'s day
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Time grid */}
      <div className="relative grid grid-cols-[60px_repeat(7,1fr)] min-h-[896px]">
        {/* Time labels */}
        <div className="border-r border-slate-200 dark:border-slate-700">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-16 pr-2 text-right text-xs text-slate-500 dark:text-slate-400 -mt-2"
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((date, dayIndex) => {
          const dayEvents = getEventsForDay(date)
          const timedEvents = dayEvents.filter(e => e.startTime)
          const allDayEvents = dayEvents.filter(e => e.allDay || !e.startTime)

          return (
            <div
              key={date.toISOString()}
              className={`
                relative
                ${dayIndex < 6 ? 'border-r border-slate-200 dark:border-slate-700' : ''}
              `}
            >
              {/* Hour lines */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-slate-100 dark:border-slate-700/50"
                />
              ))}

              {/* All-day events at top */}
              {allDayEvents.length > 0 && (
                <div className="absolute top-0 left-1 right-1 space-y-1 pt-1">
                  {allDayEvents.slice(0, 2).map((event) => (
                    <EventPill
                      key={event.id}
                      event={event}
                      eventCategories={eventCategories}
                      onClick={() => onEventClick?.(event.id)}
                      compact
                    />
                  ))}
                </div>
              )}

              {/* Timed events */}
              {timedEvents.map((event) => {
                const position = getEventPosition(event)
                if (!position) return null

                return (
                  <div
                    key={event.id}
                    className="absolute left-1 right-1"
                    style={{
                      top: `${position.top}px`,
                      height: `${position.height}px`,
                    }}
                  >
                    <EventPill
                      event={event}
                      eventCategories={eventCategories}
                      onClick={() => onEventClick?.(event.id)}
                      showTime
                    />
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Current time indicator */}
        <div
          className="absolute left-[60px] right-0 flex items-center z-20 pointer-events-none"
          style={{ top: `${((9 - 7) * 60 + 30) / 60 * 64}px` }} // 9:30 AM for demo
        >
          <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1" />
          <div className="flex-1 h-0.5 bg-rose-500" />
        </div>
      </div>
    </div>
  )
}
