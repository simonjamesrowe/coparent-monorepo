'use client'

import { LogOut } from 'lucide-react'

interface UserMenuProps {
  user?: {
    name: string
    avatarUrl?: string
  }
  onLogout?: () => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  if (!user) return null

  const initials = getInitials(user.name)

  return (
    <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-rose-500 flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
        )}

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
            {user.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Parent
          </div>
        </div>

        {/* Logout button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        )}
      </div>
    </div>
  )
}
