import type { Event, Parent, ProposedChange } from '../types'
import { useState, useMemo } from 'react'

export interface ScheduleChangeRequestModalProps {
  /** Whether the drawer is open */
  isOpen: boolean
  /** The custody event being modified */
  originalEvent: Event | null
  /** Map of parent IDs to parent data */
  parents: Record<string, Parent>
  /** ID of the current logged-in parent (the requester) */
  currentParentId: string
  /** Called when the drawer should close */
  onClose?: () => void
  /** Called when the user submits the request */
  onSubmit?: (data: { proposedChange: ProposedChange; reason: string }) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function getDaysBetween(start: string, end: string): number {
  const startDate = new Date(start + 'T12:00:00')
  const endDate = new Date(end + 'T12:00:00')
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
}

export function ScheduleChangeRequestModal({
  isOpen,
  originalEvent,
  parents,
  currentParentId,
  onClose,
  onSubmit,
}: ScheduleChangeRequestModalProps) {
  const [changeType, setChangeType] = useState<ProposedChange['type']>('swap')
  const [newStartDate, setNewStartDate] = useState('')
  const [newEndDate, setNewEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when drawer opens with new event
  useMemo(() => {
    if (originalEvent) {
      setNewStartDate(originalEvent.startDate)
      setNewEndDate(originalEvent.endDate || originalEvent.startDate)
      setChangeType('swap')
      setReason('')
    }
  }, [originalEvent?.id])

  if (!isOpen || !originalEvent) return null

  const otherParent = Object.values(parents).find(p => p.id !== currentParentId)
  const eventOwner = originalEvent.parentId ? parents[originalEvent.parentId] : null

  const originalDays = getDaysBetween(originalEvent.startDate, originalEvent.endDate || originalEvent.startDate)
  const newDays = newStartDate && newEndDate ? getDaysBetween(newStartDate, newEndDate) : 0
  const daysDiff = newDays - originalDays

  const handleSubmit = () => {
    if (!newStartDate || !newEndDate || !reason.trim()) return

    setIsSubmitting(true)

    onSubmit?.({
      proposedChange: {
        type: changeType,
        originalStartDate: originalEvent.startDate,
        originalEndDate: originalEvent.endDate,
        newStartDate,
        newEndDate,
      },
      reason: reason.trim(),
    })

    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false)
      onClose?.()
    }, 500)
  }

  const isFormValid = newStartDate && newEndDate && reason.trim().length >= 10

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-0 z-50 flex justify-end">
        <div
          className="h-full w-full bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200/60
                     dark:border-slate-700/60 animate-in slide-in-from-right duration-300 sm:w-3/4 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            {/* Decorative gradient accent */}
            <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-rose-400 rounded-full" />

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Request Schedule Change
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Request approval from {otherParent?.name || 'the other parent'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 -m-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                         transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5 flex-1 overflow-y-auto">
            {/* Original Schedule Card */}
            <div className="relative">
              <div className="absolute -left-3 top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200/60 dark:border-slate-600/60">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    eventOwner?.color === 'violet' ? 'bg-violet-500' : 'bg-sky-500'
                  }`} />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Current Schedule
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {formatDate(originalEvent.startDate)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      to {formatDate(originalEvent.endDate || originalEvent.startDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      {originalDays}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {originalDays === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* Change Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type of Change
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'swap', label: 'Swap Days', icon: '↔️', desc: 'Trade days' },
                  { value: 'extend', label: 'Adjust Time', icon: '📅', desc: 'Change dates' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setChangeType(option.value as ProposedChange['type'])}
                    className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      changeType === option.value
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <p className={`mt-1 font-medium text-sm ${
                      changeType === option.value
                        ? 'text-teal-700 dark:text-teal-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {option.label}
                    </p>
                    {changeType === option.value && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Proposed New Dates */}
            <div className="relative">
              <div className="absolute -left-3 top-0 bottom-0 w-1 bg-teal-500 rounded-full" />
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 border border-teal-200/60 dark:border-teal-700/60">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-300 uppercase tracking-wide">
                    Proposed Schedule
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-teal-600 dark:text-teal-400 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={e => setNewStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-teal-200
                               dark:border-teal-700 text-slate-800 dark:text-slate-100 text-sm
                               focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none
                               transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-teal-600 dark:text-teal-400 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={e => setNewEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-teal-200
                               dark:border-teal-700 text-slate-800 dark:text-slate-100 text-sm
                               focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none
                               transition-shadow"
                    />
                  </div>
                </div>

                {/* Days difference indicator */}
                {newDays > 0 && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-teal-600 dark:text-teal-400">
                      {formatDate(newStartDate)} → {formatDate(newEndDate)}
                    </span>
                    <span className={`font-semibold ${
                      daysDiff === 0
                        ? 'text-teal-600 dark:text-teal-400'
                        : daysDiff > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {newDays} {newDays === 1 ? 'day' : 'days'}
                      {daysDiff !== 0 && (
                        <span className="ml-1 text-xs">
                          ({daysDiff > 0 ? '+' : ''}{daysDiff})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Reason Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Reason for Request
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Explain why you're requesting this change. Be specific so the other parent can make an informed decision..."
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200
                         dark:border-slate-600 text-slate-800 dark:text-slate-100 text-sm
                         placeholder:text-slate-400 dark:placeholder:text-slate-500
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none
                         transition-shadow resize-none"
              />
              <p className={`mt-1.5 text-xs ${
                reason.length < 10
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-teal-600 dark:text-teal-400'
              }`}>
                {reason.length < 10
                  ? `${10 - reason.length} more characters needed`
                  : '✓ Reason provided'
                }
              </p>
            </div>

            {/* Info callout */}
            <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200/60 dark:border-amber-700/40">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {otherParent?.name || 'The other parent'} will be notified and must approve this change before it takes effect.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400
                         hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl
                         transition-all duration-200 ${
                  isFormValid && !isSubmitting
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
