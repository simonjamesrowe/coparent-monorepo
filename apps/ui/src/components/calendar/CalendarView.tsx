import type { CalendarSchedulingProps, Parent } from '../../types/calendar'
import { useState, useMemo } from 'react'
import { CalendarHeader } from './CalendarHeader'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { DayView } from './DayView'
import { PendingRequestsBadge } from './PendingRequestsBadge'

type ViewMode = 'month' | 'week' | 'day'

export function CalendarView({
  parents,
  children,
  events,
  scheduleChangeRequests,
  currentParentId,
  onViewEvent,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onRequestScheduleChange,
  onApproveRequest,
  onDeclineRequest,
  onViewRequest,
  onChangeView,
  onNavigateDate,
}: CalendarSchedulingProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const pendingRequests = scheduleChangeRequests.filter(r => r.status === 'pending')
  const incomingRequests = pendingRequests.filter(r => r.requestedBy !== currentParentId)

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
    onChangeView?.(view)
  }

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    let newDate: Date

    if (direction === 'today') {
      newDate = new Date() // Current date
    } else {
      const offset = direction === 'prev' ? -1 : 1
      switch (viewMode) {
        case 'month':
          newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
          break
        case 'week':
          newDate = new Date(currentDate.getTime() + offset * 7 * 24 * 60 * 60 * 1000)
          break
        case 'day':
          newDate = new Date(currentDate.getTime() + offset * 24 * 60 * 60 * 1000)
          break
        default:
          newDate = currentDate
      }
    }

    setCurrentDate(newDate)
    onNavigateDate?.(newDate.toISOString().split('T')[0])
  }

  const handleDayClick = (date: Date) => {
    setCurrentDate(date)
    if (viewMode === 'month') {
      setViewMode('day')
      onChangeView?.('day')
    }
    onNavigateDate?.(date.toISOString().split('T')[0])
  }

  const parentsMap = useMemo(() => {
    const map: Record<string, Parent> = {}
    parents.forEach(p => { map[p.id] = p })
    return map
  }, [parents])

  const handleCreateEventClick = () => {
    onCreateEvent?.()
  }

  const normalizeType = (value: string) => value.trim().toLowerCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      {/* Subtle pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                Family Calendar
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
                Shared schedule for {children.map(c => c.name).join(' & ')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Pending Requests Badge */}
              {incomingRequests.length > 0 && (
                <PendingRequestsBadge
                  count={incomingRequests.length}
                  onClick={() => onViewRequest?.(incomingRequests[0].id)}
                />
              )}

              {/* Add Event Button */}
              <button
                onClick={handleCreateEventClick}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700
                         text-white text-sm font-medium rounded-xl shadow-lg shadow-teal-500/20
                         transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/30
                         hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Event</span>
              </button>
            </div>
          </div>

          {/* Parent Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {parents.map(parent => (
              <div key={parent.id} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    parent.color === 'violet'
                      ? 'bg-violet-500'
                      : 'bg-sky-500'
                  }`}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {parent.name}'s time
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Navigation Header */}
          <CalendarHeader
            currentDate={currentDate}
            viewMode={viewMode}
            onViewChange={handleViewChange}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Calendar Body */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl shadow-slate-200/50
                      dark:shadow-slate-900/50 border border-slate-200/60 dark:border-slate-700/60
                      overflow-hidden backdrop-blur-sm">
          {viewMode === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              parents={parentsMap}
              onDayClick={handleDayClick}
              onEventClick={onViewEvent}
            />
          )}
          {viewMode === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              parents={parentsMap}
              onDayClick={handleDayClick}
              onEventClick={onViewEvent}
            />
          )}
          {viewMode === 'day' && (
            <DayView
              currentDate={currentDate}
              events={events}
              parents={parentsMap}
              children={children}
              onEventClick={onViewEvent}
              onCreateEvent={handleCreateEventClick}
            />
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'This Month', value: events.filter(e => e.startDate.startsWith('2025-01')).length, suffix: 'events' },
            { label: 'Activities', value: events.filter(e => normalizeType(e.type) === 'activity').length, suffix: 'scheduled' },
            { label: 'Medical', value: events.filter(e => normalizeType(e.type) === 'medical').length, suffix: 'appointments' },
            { label: 'Pending', value: pendingRequests.length, suffix: 'requests' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white/60 dark:bg-slate-800/30 rounded-xl p-3 border border-slate-200/40
                       dark:border-slate-700/40 backdrop-blur-sm"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
                {stat.value} <span className="text-xs font-normal text-slate-400">{stat.suffix}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
