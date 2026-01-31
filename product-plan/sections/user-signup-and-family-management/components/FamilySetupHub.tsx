import type {
  UserSignupAndFamilyManagementProps,
  InvitationStatus,
  ParentRole,
} from '../types'

interface FamilySetupHubProps
  extends Pick<
    UserSignupAndFamilyManagementProps,
    | 'families'
    | 'parents'
    | 'children'
    | 'invitations'
    | 'onUpdateFamily'
    | 'onAddChild'
    | 'onUpdateChild'
    | 'onInviteCoParent'
    | 'onResendInvite'
    | 'onCancelInvite'
    | 'onAssignRole'
  > {
  activeFamilyId?: string
}

function getInvitationStatusBadge(status: InvitationStatus) {
  const badges = {
    pending: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-300',
      label: 'Pending',
    },
    accepted: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      label: 'Accepted',
    },
    expired: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-500 dark:text-slate-400',
      label: 'Expired',
    },
    canceled: {
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      text: 'text-rose-700 dark:text-rose-300',
      label: 'Canceled',
    },
  }
  return badges[status]
}

function getRoleBadge(role: ParentRole) {
  return role === 'primary'
    ? {
        bg: 'bg-teal-100 dark:bg-teal-900/30',
        text: 'text-teal-700 dark:text-teal-300',
        label: 'Primary',
      }
    : {
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        text: 'text-violet-700 dark:text-violet-300',
        label: 'Co-Parent',
      }
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export function FamilySetupHub({
  families,
  parents,
  children,
  invitations,
  activeFamilyId,
  onUpdateFamily,
  onAddChild,
  onUpdateChild,
  onInviteCoParent,
  onResendInvite,
  onCancelInvite,
  onAssignRole,
}: FamilySetupHubProps) {
  const activeFamily = families.find((f) => f.id === activeFamilyId)
  const familyParents = parents.filter((p) => p.familyId === activeFamilyId)
  const familyChildren = children.filter((c) => c.familyId === activeFamilyId)
  const familyInvitations = invitations.filter((i) => i.familyId === activeFamilyId)
  const pendingInvites = familyInvitations.filter((i) => i.status === 'pending')

  if (!activeFamily) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400">No family selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      {/* Decorative background */}
      <div
        className="fixed inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Family Setup
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {activeFamily.name}
              </h1>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
            Manage your family details, child profiles, co-parent invitations, and
            role assignments all in one place.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Parents
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {familyParents.length}
            </p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Children
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {familyChildren.length}
            </p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Pending Invites
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingInvites.length}
            </p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Time Zone
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {activeFamily.timeZone.split('/')[1]?.replace('_', ' ') || activeFamily.timeZone}
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Family Card */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-teal-600 dark:text-teal-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Family Details
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateFamily?.(activeFamily.id, {})}
                  className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
                >
                  Edit
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  Family Name
                </p>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {activeFamily.name}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  Time Zone
                </p>
                <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                  {activeFamily.timeZone}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  Created
                </p>
                <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                  {new Date(activeFamily.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Parents & Roles Card */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-violet-600 dark:text-violet-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Parents & Roles
                </h2>
              </div>
            </div>
            <div className="p-6">
              {familyParents.length > 0 ? (
                <div className="space-y-3">
                  {familyParents.map((parent) => {
                    const roleBadge = getRoleBadge(parent.role)
                    return (
                      <div
                        key={parent.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white font-bold">
                            {parent.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {parent.fullName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {parent.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadge.bg} ${roleBadge.text}`}
                          >
                            {roleBadge.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => onAssignRole?.(parent.id, parent.role)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No parents assigned yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Children Card */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-amber-600 dark:text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Children
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onAddChild}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-md shadow-amber-500/20 transition-all hover:shadow-lg hover:shadow-amber-500/30"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Child
                </button>
              </div>
            </div>
            <div className="p-6">
              {familyChildren.length > 0 ? (
                <div className="space-y-3">
                  {familyChildren.map((child) => (
                    <div
                      key={child.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-amber-200 dark:hover:border-amber-800 transition group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {child.fullName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {child.fullName}
                              </p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {calculateAge(child.dateOfBirth)} yrs
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                              Born {child.dateOfBirth}
                            </p>
                            {child.school && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-1">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                                  />
                                </svg>
                                {child.school}
                              </div>
                            )}
                            {child.medicalNotes && (
                              <div className="flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-2">
                                <svg
                                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                  />
                                </svg>
                                <span className="line-clamp-2">{child.medicalNotes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onUpdateChild?.(child.id, {})}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition opacity-0 group-hover:opacity-100"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/20 mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    No children added yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Add child profiles to start organizing your co-parenting schedule
                  </p>
                  <button
                    type="button"
                    onClick={onAddChild}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-md shadow-amber-500/20 transition-all hover:shadow-lg hover:shadow-amber-500/30"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Your First Child
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Invitations Card */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-rose-600 dark:text-rose-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Co-Parent Invitations
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    activeFamilyId &&
                    onInviteCoParent?.(activeFamilyId, '', 'co-parent')
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg shadow-md shadow-rose-500/20 transition-all hover:shadow-lg hover:shadow-rose-500/30"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Invite
                </button>
              </div>
            </div>
            <div className="p-6">
              {familyInvitations.length > 0 ? (
                <div className="space-y-3">
                  {familyInvitations.map((invite) => {
                    const statusBadge = getInvitationStatusBadge(invite.status)
                    const roleBadge = getRoleBadge(invite.role)
                    return (
                      <div
                        key={invite.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                              {invite.email}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Sent{' '}
                              {new Date(invite.sentAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}
                            >
                              {statusBadge.label}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}
                            >
                              {roleBadge.label}
                            </span>
                          </div>
                        </div>
                        {invite.status === 'pending' && (
                          <div className="flex gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                            <button
                              type="button"
                              onClick={() => onResendInvite?.(invite.id)}
                              className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition"
                            >
                              Resend
                            </button>
                            <button
                              type="button"
                              onClick={() => onCancelInvite?.(invite.id)}
                              className="flex-1 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-700 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {invite.status === 'accepted' && invite.acceptedAt && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                            Accepted on{' '}
                            {new Date(invite.acceptedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/20 mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-rose-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    No invitations sent
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Invite your co-parent to collaborate on schedules and shared
                    information
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      activeFamilyId &&
                      onInviteCoParent?.(activeFamilyId, '', 'co-parent')
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg shadow-md shadow-rose-500/20 transition-all hover:shadow-lg hover:shadow-rose-500/30"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Send First Invitation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
