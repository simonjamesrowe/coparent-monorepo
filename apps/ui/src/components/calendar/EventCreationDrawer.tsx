import type { Event, Parent, Child } from '../../types/calendar'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Drawer } from 'vaul'
import { EventCreationForm, EventCreationFormRef } from './EventCreationForm'
import { X } from 'lucide-react'

export interface EventCreationDrawerProps {
  open: boolean
  onClose: () => void
  initialDate: string
  parents: Parent[]
  children: Child[]
  event?: Event
  mode?: 'create' | 'edit'
  currentParentId: string
  onSubmit: (eventData: Omit<Event, 'id'>) => Promise<void>
}

export function EventCreationDrawer({
  open,
  onClose,
  initialDate,
  parents,
  children,
  event,
  mode = 'create',
  currentParentId,
  onSubmit,
}: EventCreationDrawerProps) {
  const [isValid, setIsValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<EventCreationFormRef>(null)

  useEffect(() => {
    if (mode !== 'edit' || !event) return
    const hasTitle = Boolean(event.title?.trim())
    const hasType = Boolean(event.type?.trim())
    const hasStart = Boolean(event.startDate)
    setIsValid(hasTitle && hasType && hasStart)
  }, [mode, event])

  const handleSubmit = async () => {
    if (!isValid || isSubmitting || !formRef.current) return

    setIsSubmitting(true)
    try {
      formRef.current.submit()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormSubmit = async (eventData: Omit<Event, 'id'>) => {
    await onSubmit(eventData)
    onClose()
  }

  if (!open) return null

  return (
    <Drawer.Root open={open} onOpenChange={(open) => !open && onClose()} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 right-0 top-0 z-50 w-full sm:w-5/6 md:w-4/5 lg:w-3/4 max-w-none bg-white dark:bg-slate-900 shadow-xl outline-none">
          <Drawer.Title className="sr-only">
            {mode === 'edit' ? 'Edit Event' : 'Create Event'}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            {mode === 'edit'
              ? 'Update a calendar event for your family'
              : 'Create a new calendar event for your family'}
          </Drawer.Description>
          <div className="flex h-full flex-col">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {mode === 'edit' ? 'Edit Event' : 'Create Event'}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <EventCreationForm
                  parents={parents}
                  children={children}
                  currentParentId={currentParentId}
                  initialDate={initialDate}
                  initialEvent={event}
                  onSubmit={handleFormSubmit}
                  onCancel={onClose}
                  onValidationChange={setIsValid}
                  ref={formRef}
                />
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300
                           hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300
                           dark:disabled:bg-slate-700 text-white text-sm font-medium rounded-xl
                           shadow-lg shadow-teal-500/20 transition-all duration-200
                           hover:shadow-xl hover:shadow-teal-500/30 disabled:shadow-none
                           disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
