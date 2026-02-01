import { useMemo } from 'react'
import type {
  DashboardProps,
  Event,
  Expense,
  PermissionRequest,
  QuickAction,
  WidgetCard
} from '../../../../../types'

const widgetSizeStyles: Record<WidgetCard['size'], string> = {
  sm: 'md:col-span-2',
  md: 'md:col-span-3',
  lg: 'md:col-span-4 md:row-span-2'
}

const trendStyles: Record<WidgetCard['trend'], string> = {
  up: 'text-teal-600 dark:text-teal-300',
  down: 'text-rose-600 dark:text-rose-300',
  flat: 'text-slate-500 dark:text-slate-400'
}

const cardBase =
  'rounded-3xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-900'

const heroBase =
  'rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.45)] dark:border-slate-800/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

const getStatusTone = (status: PermissionRequest['status'] | Expense['status']) => {
  if (status === 'approved' || status === 'reimbursed') return 'text-teal-700 bg-teal-50 dark:bg-teal-900/40 dark:text-teal-200'
  if (status === 'denied') return 'text-rose-700 bg-rose-50 dark:bg-rose-900/40 dark:text-rose-200'
  return 'text-amber-700 bg-amber-50 dark:bg-amber-900/40 dark:text-amber-200'
}

const eventTone: Record<Event['type'], string> = {
  custody: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
  activity: 'bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950',
  appointment: 'bg-rose-600 text-white dark:bg-rose-500 dark:text-slate-950',
  school: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  holiday: 'bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950'
}

const actionStyleMap: Record<QuickAction['id'], string> = {
  'add-expense':
    'border border-rose-200/70 bg-rose-50 text-rose-700 shadow-rose-500/10 hover:border-rose-300 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-900/30 dark:text-rose-200',
  'create-event':
    'bg-teal-600 text-white shadow-teal-500/25 hover:bg-teal-700 dark:bg-teal-500 dark:text-slate-950',
  'send-message':
    'border border-slate-200/70 bg-white text-slate-700 shadow-slate-900/10 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
}

const shortcutStyleMap: Record<QuickAction['id'], string> = {
  'add-expense': 'border-rose-200 text-rose-600 dark:border-rose-900/60 dark:text-rose-200',
  'create-event': 'border-white/30 text-white/80 dark:border-teal-200/60 dark:text-teal-100',
  'send-message': 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300'
}

export function DashboardOverview({
  family,
  parents,
  children,
  upcomingEvents,
  permissionRequests,
  expenses,
  messages,
  invitations,
  activityFeed,
  budgetSummary,
  approvalsSummary,
  setupChecklist,
  widgetCards,
  quickActions,
  onOpenProfileDrawer,
  onOpenChildrenDrawer,
  onOpenInvitationsDrawer,
  onAddChild,
  onEditChild,
  onResendInvitation,
  onCancelInvitation,
  onNavigateSection,
  onViewApproval,
  onViewEvent,
  onViewExpense,
  onOpenMessageThread,
  onQuickAddExpense,
  onQuickCreateEvent,
  onQuickSendMessage
}: DashboardProps) {
  const parentLookup = useMemo(() => {
    return parents.reduce<Record<string, string>>((acc, parent) => {
      acc[parent.id] = parent.fullName
      return acc
    }, {})
  }, [parents])

  const currentParent = useMemo(() => {
    return parents.find(parent => parent.id === family.primaryParentId) ?? parents[0]
  }, [family.primaryParentId, parents])

  const pendingApprovals = permissionRequests.filter(request => request.status === 'pending')
  const unreadMessages = messages.filter(message => message.unread)
  const pendingInvites = invitations.filter(invite => invite.status === 'pending')

  const quickActionHandlers: Record<QuickAction['id'], (() => void) | undefined> = {
    'add-expense': onQuickAddExpense,
    'create-event': onQuickCreateEvent,
    'send-message': onQuickSendMessage
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className={heroBase}>
          <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-teal-600 dark:text-teal-400">Family Dashboard</p>
              <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
                Welcome back{currentParent ? `, ${currentParent.fullName.split(' ')[0]}` : ''}. Keep the family in sync.
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {family.name} · Timezone {family.timezone} · {children.length} children
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
                  {approvalsSummary.totalPending} approvals awaiting response
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  {upcomingEvents.length} upcoming events queued
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                  {unreadMessages.length} unread messages
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenProfileDrawer}
                className="rounded-full border border-slate-200/70 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Profile
              </button>
              <button
                onClick={onOpenChildrenDrawer}
                className="rounded-full border border-teal-200/70 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition hover:border-teal-300 hover:bg-teal-100 dark:border-teal-900/60 dark:bg-teal-900/30 dark:text-teal-200"
              >
                Children
              </button>
              <button
                onClick={onOpenInvitationsDrawer}
                className="rounded-full border border-rose-200/70 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-900/30 dark:text-rose-200"
              >
                Invitations
              </button>
            </div>
          </header>

          <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Quick actions</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Launch the most common tasks in one tap.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    onClick={quickActionHandlers[action.id]}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition hover:-translate-y-0.5 active:translate-y-0 ${
                      actionStyleMap[action.id]
                    }`}
                  >
                    {action.label}
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${shortcutStyleMap[action.id]}`}
                    >
                      {action.shortcut}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-6 auto-rows-[150px]">
          {widgetCards.map(card => (
            <button
              key={card.id}
              onClick={() => onNavigateSection?.(card.sectionId)}
              className={`${cardBase} ${widgetSizeStyles[card.size]} flex flex-col justify-between p-4 text-left transition hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700`}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{card.title}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.description}</p>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${trendStyles[card.trend]}`}>{card.delta}</span>
                <span className="text-slate-400 dark:text-slate-500">View details →</span>
              </div>
            </button>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming events</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Next 3-5 items on the shared calendar.</p>
              </div>
              <button
                onClick={() => onNavigateSection?.('calendar')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-300"
              >
                Open calendar
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {upcomingEvents.map(event => (
                <button
                  key={event.id}
                  onClick={() => onViewEvent?.(event.id)}
                  className="group flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-teal-200 dark:border-slate-800/70 dark:bg-slate-950/60"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${eventTone[event.type]}`}>
                      {event.type}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatDate(event.startAt)} · {formatTime(event.startAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{event.location || 'Location TBD'}</p>
                    </div>
                    <span className="text-xs text-slate-400 transition group-hover:text-teal-600">View →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className={`${cardBase} p-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Approvals</h3>
                <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                  {approvalsSummary.totalPending} pending
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {pendingApprovals.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No pending approvals right now.</p>
                )}
                {pendingApprovals.slice(0, 3).map(request => (
                  <button
                    key={request.id}
                    onClick={() => onViewApproval?.(request.id)}
                    className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3 text-left text-sm transition hover:border-rose-200 dark:border-slate-800/70 dark:bg-slate-950/60"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{request.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{request.summary}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className={`${cardBase} p-4`}>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Family setup</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{setupChecklist.completedCount} of {setupChecklist.totalCount} steps done</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-teal-600 dark:bg-teal-500"
                  style={{ width: `${Math.round((setupChecklist.completedCount / setupChecklist.totalCount) * 100)}%` }}
                />
              </div>
              <ul className="mt-3 space-y-2">
                {setupChecklist.items.map(item => (
                  <li key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-xs text-slate-600 dark:border-slate-800/70 dark:bg-slate-950/60 dark:text-slate-300">
                    <span>{item.label}</span>
                    <span className={item.completed ? 'text-teal-600 dark:text-teal-300' : 'text-slate-400'}>
                      {item.completed ? 'Done' : 'Pending'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Budget summary</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{budgetSummary.month} spending overview</p>
              </div>
              <button
                onClick={() => onNavigateSection?.('expenses')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-300"
              >
                View expenses
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800/70 dark:bg-slate-950/60">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total spent</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(budgetSummary.totalSpent)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Limit {formatCurrency(budgetSummary.totalLimit)}</span>
                <span>{formatCurrency(budgetSummary.remaining)} remaining</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-teal-600 dark:bg-teal-500"
                  style={{ width: `${Math.min(100, (budgetSummary.totalSpent / budgetSummary.totalLimit) * 100)}%` }}
                />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {budgetSummary.categories.map(category => {
                const percent = Math.min(100, (category.spent / category.limit) * 100)
                return (
                  <div key={category.category} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-slate-800/70 dark:bg-slate-950/60">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900 dark:text-white">{category.category}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatCurrency(category.spent)} / {formatCurrency(category.limit)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-rose-500 dark:bg-rose-400" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className={`${cardBase} p-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent activity</h3>
                <span className="text-xs text-slate-400">{activityFeed.length} updates</span>
              </div>
              <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
                {activityFeed.map(item => (
                  <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3 text-sm dark:border-slate-800/70 dark:bg-slate-950/60">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                      <span className="text-xs text-slate-400">{formatDate(item.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.summary}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      {parentLookup[item.actorParentId] || 'Parent'} · {item.type}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${cardBase} p-4`}>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Inbox pulse</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unread messages requiring attention.</p>
              <div className="mt-3 space-y-2">
                {unreadMessages.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No unread threads.</p>
                )}
                {unreadMessages.slice(0, 3).map(message => (
                  <button
                    key={message.id}
                    onClick={() => onOpenMessageThread?.(message.threadId)}
                    className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3 text-left text-sm transition hover:border-teal-200 dark:border-slate-800/70 dark:bg-slate-950/60"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{message.subject}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{message.preview}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Children overview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Profiles and care details.</p>
              </div>
              <button
                onClick={onOpenChildrenDrawer}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-300"
              >
                Manage
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {children.map(child => (
                <div key={child.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800/70 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{child.firstName} {child.lastName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{child.school} · {child.grade}</p>
                    </div>
                    <button
                      onClick={() => onEditChild?.(child.id)}
                      className="text-xs font-semibold text-slate-500 transition hover:text-teal-600"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Notes: {child.medicalNotes}</p>
                </div>
              ))}
              <button
                onClick={onAddChild}
                className="rounded-2xl border border-dashed border-slate-300/70 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                + Add another child profile
              </button>
            </div>
          </div>

          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Invitations</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pending caregiver access requests.</p>
              </div>
              <button
                onClick={onOpenInvitationsDrawer}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-300"
              >
                Review
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {pendingInvites.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No pending invitations.</p>
              )}
              {pendingInvites.map(invitation => (
                <div key={invitation.id} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-slate-800/70 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{invitation.email}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Sent {formatDate(invitation.sentAt)}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                      {invitation.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => onResendInvitation?.(invitation.id)}
                      className="rounded-full border border-slate-200/70 px-3 py-1 text-xs font-medium text-slate-600 hover:border-teal-200 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      Resend
                    </button>
                    <button
                      onClick={() => onCancelInvitation?.(invitation.id)}
                      className="rounded-full border border-rose-200/70 px-3 py-1 text-xs font-medium text-rose-600 hover:border-rose-300 dark:border-rose-900/60 dark:text-rose-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${cardBase} p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent expenses</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest expenses with approval status.</p>
            </div>
            <button
              onClick={() => onNavigateSection?.('expenses')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-300"
            >
              See all
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {expenses.slice(0, 4).map(expense => (
              <button
                key={expense.id}
                onClick={() => onViewExpense?.(expense.id)}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-left transition hover:border-teal-200 dark:border-slate-800/70 dark:bg-slate-950/60"
              >
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-slate-900 dark:text-white">{expense.title}</p>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusTone(expense.status)}`}>
                    {expense.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{expense.category} · {formatDate(expense.date)}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(expense.amount)}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
