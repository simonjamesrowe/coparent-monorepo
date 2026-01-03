import type { Event, Parent, Child } from '../../types/calendar'
import { useMemo } from 'react'
import { getEventTypeColor } from './eventTypeColors'
import { expandRecurringEvents } from './recurrence'
import { getEventOwnerLabel } from './eventOwners'

interface DayViewProps {
  currentDate: Date
  events: Event[]
  parents: Record<string, Parent>
  children: Child[]
  onEventClick?: (eventId: string) => void
  onCreateEvent?: () => void
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6) // 6 AM to 9 PM

export function DayView({
  currentDate,
  events,
  parents,
  children,
  onEventClick,
  onCreateEvent,
}: DayViewProps) {
  const dateToYmd = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const dateStr = dateToYmd(currentDate)
  const isCustodyType = (value: string) => value.trim().toLowerCase() === 'custody'
  const toLocalDay = (value: string) => {
    const ymd = value.includes('T') ? value.slice(0, 10) : value
    return new Date(`${ymd}T12:00:00`)
  }

  const expandedEvents = useMemo(() => {
    return expandRecurringEvents(events, dateToYmd(currentDate), dateToYmd(currentDate))
  }, [events, currentDate])

  const dayEvents = useMemo(() => {
    return expandedEvents.filter(e => {
      if (isCustodyType(e.type)) return false
      return e.startDate === dateStr
    })
  }, [expandedEvents, dateStr])

  const custodyEvent = useMemo(() => {
    return expandedEvents.find(e => {
      if (!isCustodyType(e.type)) return false
      const start = toLocalDay(e.startDate)
      const end = e.endDate ? toLocalDay(e.endDate) : start
      const day = new Date(currentDate)
      day.setHours(12, 0, 0, 0)
      return day >= start && day <= end
    })
  }, [expandedEvents, currentDate])

  const custodyParent = custodyEvent?.parentId ? parents[custodyEvent.parentId] : null

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    if (hour > 12) return `${hour - 12} PM`
    return `${hour} AM`
  }

  const getEventPosition = (event: Event) => {
    if (!event.startTime) return null

    const [startHour, startMin] = event.startTime.split(':').map(Number)
    const [endHour, endMin] = event.endTime
      ? event.endTime.split(':').map(Number)
      : [startHour + 1, startMin]

    const top = ((startHour - 6) * 60 + startMin) / 60 * 80 // 80px per hour
    const height = ((endHour - startHour) * 60 + (endMin - startMin)) / 60 * 80

    return { top, height: Math.max(height, 40) }
  }

  const getEventColors = (eventType: string) => {
    const color = getEventTypeColor(eventType)
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      red: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
      amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
      green: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
      emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
      teal: { bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
      pink: { bg: 'bg-pink-50 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
      slate: { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
    }

    return colorMap[color] || colorMap.slate
  }

  const timedEvents = dayEvents.filter(e => e.startTime)
  const allDayEvents = dayEvents.filter(e => e.allDay || !e.startTime)

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar: Day summary */}
      <div className="lg:w-72 p-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        {/* Date display */}
        <div className="text-center lg:text-left mb-6">
          <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {weekdays[currentDate.getDay()]}
          </div>
          <div className="text-5xl font-bold text-slate-800 dark:text-slate-100 my-2">
            {currentDate.getDate()}
          </div>
          <div className="text-slate-600 dark:text-slate-300">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
        </div>

        {/* Custody info */}
        {custodyParent && (
          <button
            type="button"
            onClick={() => {
              if (custodyEvent) {
                onEventClick?.(custodyEvent.id)
              }
            }}
            className={`
              w-full text-left p-4 rounded-xl mb-6 border transition
              ${custodyParent.color === 'violet'
                ? 'bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800'
                : 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800'
              }
              hover:shadow-sm
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                ${custodyParent.color === 'violet' ? 'bg-violet-500' : 'bg-sky-500'}
              `}>
                {custodyParent.name[0]}
              </div>
              <div>
                <div className={`
                  text-sm font-medium
                  ${custodyParent.color === 'violet'
                    ? 'text-violet-700 dark:text-violet-300'
                    : 'text-sky-700 dark:text-sky-300'
                  }
                `}>
                  {custodyParent.name}'s day
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {children.map(c => c.name).join(' & ')} with {custodyParent.name}
                </div>
              </div>
            </div>
          </button>
        )}

        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              All Day
            </h3>
            <div className="space-y-2">
              {allDayEvents.map((event) => {
                const colors = getEventColors(event.type)
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick?.(event.sourceId ?? event.id)}
                    className={`
                      w-full text-left p-3 rounded-xl border transition-all duration-150
                      hover:shadow-md ${colors.bg} ${colors.border}
                    `}
                  >
                    <div className={`font-medium text-sm ${colors.text}`}>
                      {event.title}
                    </div>
                    {getEventOwnerLabel(event, parents) && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {getEventOwnerLabel(event, parents)}
                      </div>
                    )}
                    {event.location && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick add button */}
        <button
          onClick={onCreateEvent}
          className="w-full py-3 px-4 border-2 border-dashed border-slate-300 dark:border-slate-600
                   rounded-xl text-slate-500 dark:text-slate-400 text-sm font-medium
                   hover:border-teal-500 hover:text-teal-600 dark:hover:border-teal-500
                   dark:hover:text-teal-400 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add event
        </button>
      </div>

      {/* Main: Time grid */}
      <div className="flex-1 overflow-x-auto">
        <div className="relative min-h-[1280px]"> {/* 16 hours × 80px */}
          {/* Hour lines */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 flex items-start border-t border-slate-100 dark:border-slate-700/50"
              style={{ top: `${(hour - 6) * 80}px`, height: '80px' }}
            >
              <div className="w-16 pr-2 text-right text-xs text-slate-400 dark:text-slate-500 -mt-2 flex-shrink-0">
                {formatHour(hour)}
              </div>
              <div className="flex-1" />
            </div>
          ))}

          {/* Timed events */}
          {timedEvents.map((event) => {
            const position = getEventPosition(event)
            if (!position) return null

            const colors = getEventColors(event.type)
            const eventChildren = children.filter(c => event.childIds.includes(c.id))

            return (
              <button
                key={event.id}
                onClick={() => onEventClick?.(event.sourceId ?? event.id)}
                className={`
                  absolute left-20 right-4 p-3 rounded-xl border text-left
                  transition-all duration-150 hover:shadow-lg hover:scale-[1.02]
                  ${colors.bg} ${colors.border}
                `}
                style={{
                  top: `${position.top}px`,
                  minHeight: `${position.height}px`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={`font-semibold ${colors.text}`}>
                      {event.title}
                    </div>
                    {getEventOwnerLabel(event, parents) && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {getEventOwnerLabel(event, parents)}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {event.startTime} – {event.endTime}
                    </div>
                  </div>
                  {eventChildren.length > 0 && (
                    <div className="flex -space-x-1">
                      {eventChildren.map((child) => (
                        <div
                          key={child.id}
                          className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-medium text-slate-600 dark:text-slate-300"
                          title={child.name}
                        >
                          {child.name[0]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {event.location && position.height > 60 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                {event.notes && position.height > 80 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {event.notes}
                  </div>
                )}
              </button>
            )
          })}

          {/* Current time indicator */}
          <div
            className="absolute left-16 right-0 flex items-center z-20 pointer-events-none"
            style={{ top: `${((9 - 6) * 60 + 30) / 60 * 80}px` }} // 9:30 AM for demo
          >
            <div className="w-3 h-3 rounded-full bg-rose-500 -ml-1.5 shadow-lg shadow-rose-500/50" />
            <div className="flex-1 h-0.5 bg-rose-500 shadow-sm shadow-rose-500/50" />
          </div>
        </div>
      </div>
    </div>
  )
}
