import type { Child, Event, EventCategory, Parent, RecurringPattern } from '../types'
import { useMemo, useState } from 'react'
import { EventPill } from './EventPill'

export interface EventCreationFormProps {
  parents: Parent[]
  children: Child[]
  eventCategories: EventCategory[]
  currentParentId: string
  onSubmit?: (data: Omit<Event, 'id'>) => void
  onCancel?: () => void
  onCreateCategory?: () => void
  onEditCategory?: (categoryId: string) => void
  onDeleteCategory?: (categoryId: string) => void
}

const TYPE_OPTIONS: Array<{ value: Event['type']; label: string; description: string }> = [
  { value: 'activity', label: 'Activity', description: 'Sports, lessons, clubs, playdates' },
  { value: 'medical', label: 'Medical', description: 'Doctor visits, therapy, dental' },
  { value: 'school', label: 'School', description: 'Conferences, events, deadlines' },
  { value: 'holiday', label: 'Holiday', description: 'Holidays, birthdays, family trips' },
  { value: 'custody', label: 'Custody', description: 'Overnight schedule blocks' },
]

const WEEKDAYS = [
  { value: 'monday', label: 'M' },
  { value: 'tuesday', label: 'Tu' },
  { value: 'wednesday', label: 'W' },
  { value: 'thursday', label: 'Th' },
  { value: 'friday', label: 'F' },
  { value: 'saturday', label: 'Sa' },
  { value: 'sunday', label: 'Su' },
]

export function EventCreationForm({
  parents,
  children,
  eventCategories,
  currentParentId,
  onSubmit,
  onCancel,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}: EventCreationFormProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<Event['type']>('activity')
  const [categoryId, setCategoryId] = useState(eventCategories[0]?.id || '')
  const [startDate, setStartDate] = useState('2025-01-07')
  const [endDate, setEndDate] = useState('2025-01-07')
  const [startTime, setStartTime] = useState('16:00')
  const [endTime, setEndTime] = useState('17:30')
  const [allDay, setAllDay] = useState(false)
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>(children.map(child => child.id))
  const [custodyParentId, setCustodyParentId] = useState(currentParentId)
  const [recurrence, setRecurrence] = useState<RecurringPattern | null>(null)

  const defaultCategories = eventCategories.filter(category => category.isDefault)
  const customCategories = eventCategories.filter(category => !category.isDefault)

  const selectedCategory = eventCategories.find(category => category.id === categoryId)

  const isCustody = type === 'custody'

  const isValid = title.trim().length > 0 && startDate.length > 0 && categoryId.length > 0

  const previewEvent: Event = useMemo(() => {
    return {
      id: 'preview',
      type,
      title: title.trim() || 'New Event',
      startDate,
      endDate: isCustody ? endDate : startDate,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      allDay: isCustody ? true : allDay,
      parentId: isCustody ? custodyParentId : null,
      childIds: selectedChildIds,
      categoryId: categoryId || eventCategories[0]?.id || '',
      location: location || undefined,
      notes: notes.trim() || null,
      recurring: recurrence,
    }
  }, [
    type,
    title,
    startDate,
    endDate,
    startTime,
    endTime,
    allDay,
    custodyParentId,
    selectedChildIds,
    categoryId,
    eventCategories,
    location,
    notes,
    recurrence,
    isCustody,
  ])

  const handleToggleChild = (childId: string) => {
    setSelectedChildIds(prev =>
      prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    )
  }

  const handleChangeType = (nextType: Event['type']) => {
    setType(nextType)
    if (nextType === 'custody') {
      setAllDay(true)
    }
  }

  const handleRecurrence = (frequency: RecurringPattern['frequency'] | 'none') => {
    if (frequency === 'none') {
      setRecurrence(null)
      return
    }
    if (frequency === 'weekly') {
      setRecurrence({ frequency: 'weekly', days: ['tuesday'] })
      return
    }
    setRecurrence({ frequency })
  }

  const handleToggleRecurrenceDay = (day: string) => {
    if (!recurrence || recurrence.frequency !== 'weekly') return
    const days = recurrence.days || []
    const nextDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day]
    setRecurrence({ ...recurrence, days: nextDays })
  }

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit?.({
      type: previewEvent.type,
      title: previewEvent.title,
      startDate: previewEvent.startDate,
      endDate: previewEvent.endDate,
      startTime: previewEvent.startTime,
      endTime: previewEvent.endTime,
      allDay: previewEvent.allDay,
      parentId: previewEvent.parentId,
      childIds: previewEvent.childIds,
      categoryId: previewEvent.categoryId,
      location: previewEvent.location,
      notes: previewEvent.notes,
      recurring: previewEvent.recurring,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/30">
      <div
        className="fixed inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '26px 26px'
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Calendar · New Event
                  </p>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                    Create a shared moment
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                    Add activities, appointments, or custody blocks. Keep both parents aligned with clear categories and timing.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium shadow-lg shadow-teal-500/20 hover:bg-teal-700 hover:shadow-teal-500/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Save Event
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Event essentials</h2>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Emma Soccer Practice"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Event type</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {TYPE_OPTIONS.map(option => {
                      const selected = type === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleChangeType(option.value)}
                          className={`rounded-xl border px-4 py-3 text-left transition ${
                            selected
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{option.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{option.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                    <div className="flex gap-2">
                      <select
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                      >
                        {defaultCategories.length > 0 && (
                          <optgroup label="Default">
                            {defaultCategories.map(category => (
                              <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                          </optgroup>
                        )}
                        {customCategories.length > 0 && (
                          <optgroup label="Custom">
                            {customCategories.map(category => (
                              <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={onCreateCategory}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        New
                      </button>
                    </div>
                    {customCategories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {customCategories.slice(0, 4).map(category => (
                          <div
                            key={category.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-900/30 text-xs text-rose-700 dark:text-rose-200"
                          >
                            <span>{category.name}</span>
                            <button
                              type="button"
                              onClick={() => onEditCategory?.(category.id)}
                              className="text-[10px] uppercase tracking-wide text-rose-600 dark:text-rose-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteCategory?.(category.id)}
                              className="text-[10px] uppercase tracking-wide text-rose-600 dark:text-rose-200"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">All day</label>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={isCustody ? true : allDay}
                        onChange={(event) => setAllDay(event.target.checked)}
                        disabled={isCustody}
                        className="h-4 w-4 text-teal-600 rounded border-slate-300"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Runs all day</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isCustody ? 'Custody blocks are all-day by default.' : 'Hide time slots and show as all-day.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Schedule</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>
              </div>

              {!allDay && !isCustody && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>
                </div>
              )}

              <div className="mt-5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Repeats</label>
                <div className="flex flex-wrap gap-2">
                  {['none', 'daily', 'weekly', 'monthly', 'yearly'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleRecurrence(option as RecurringPattern['frequency'] | 'none')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        (option === 'none' && !recurrence) || recurrence?.frequency === option
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-200'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {option === 'none' ? 'Does not repeat' : `Every ${option}`}
                    </button>
                  ))}
                </div>

                {recurrence?.frequency === 'weekly' && (
                  <div className="mt-3 flex gap-2">
                    {WEEKDAYS.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleToggleRecurrenceDay(day.value)}
                        className={`w-9 h-9 rounded-full text-xs font-semibold border transition ${
                          recurrence.days?.includes(day.value)
                            ? 'border-teal-500 bg-teal-500 text-white'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">People & context</h2>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Children</label>
                  <div className="flex flex-wrap gap-2">
                    {children.map(child => {
                      const selected = selectedChildIds.includes(child.id)
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleToggleChild(child.id)}
                          className={`px-3 py-1.5 rounded-full border text-sm transition ${
                            selected
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-200'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {child.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {isCustody && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Custody with</label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {parents.map(parent => {
                        const selected = custodyParentId === parent.id
                        return (
                          <button
                            key={parent.id}
                            type="button"
                            onClick={() => setCustodyParentId(parent.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${
                              selected
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full ${parent.color === 'violet' ? 'bg-violet-500' : 'bg-sky-500'}`} />
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{parent.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Primary custody owner</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="Add location or address"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shared visibility</label>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                      <p className="text-sm text-slate-600 dark:text-slate-300">Visible to both parents and linked children</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    placeholder="Add reminders, what to bring, or additional details"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-[320px] space-y-4">
            <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/60 p-5">
              <h3 className="text-sm uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Preview</h3>
              <div className="mt-4">
                <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/60 p-3 bg-slate-50 dark:bg-slate-800/60">
                  <EventPill event={previewEvent} eventCategories={eventCategories} showTime={!previewEvent.allDay} />
                  <div className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <p><span className="font-semibold text-slate-600 dark:text-slate-300">Category:</span> {selectedCategory?.name || 'Uncategorized'}</p>
                    <p><span className="font-semibold text-slate-600 dark:text-slate-300">When:</span> {previewEvent.startDate}{previewEvent.endDate && previewEvent.endDate !== previewEvent.startDate ? ` → ${previewEvent.endDate}` : ''}</p>
                    {previewEvent.startTime && (
                      <p><span className="font-semibold text-slate-600 dark:text-slate-300">Time:</span> {previewEvent.startTime}–{previewEvent.endTime}</p>
                    )}
                    {previewEvent.location && (
                      <p><span className="font-semibold text-slate-600 dark:text-slate-300">Location:</span> {previewEvent.location}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-rose-200/70 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/20 p-3">
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-200">Shared clarity</p>
                <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-200/70">
                  Events with clear categories reduce follow-up messages and make approvals faster.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quick guidance</h3>
              <div className="mt-3 space-y-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex gap-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-teal-500" />
                  <p>Use the category to match existing custody or activity color coding.</p>
                </div>
                <div className="flex gap-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-rose-500" />
                  <p>Recurring events keep schedules consistent week-to-week.</p>
                </div>
                <div className="flex gap-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-slate-400" />
                  <p>Custody entries are all-day blocks and default to the primary parent.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
