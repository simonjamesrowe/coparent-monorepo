'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'

export interface NavigationItem {
  label: string
  href: string
  icon?: React.ReactNode
  isActive?: boolean
}

export interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  user?: {
    name: string
    avatarUrl?: string
  }
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

export function AppShell({
  children,
  navigationItems,
  user,
  onNavigate,
  onLogout,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
            CP
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white">
            CoParent
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          ) : (
            <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          )}
        </button>
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-[260px] bg-white dark:bg-slate-800
          border-r border-slate-200 dark:border-slate-700
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-slate-200 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
            CP
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white">
            CoParent
          </span>
        </div>

        {/* Navigation */}
        <MainNav
          items={navigationItems}
          onNavigate={(href) => {
            onNavigate?.(href)
            setSidebarOpen(false)
          }}
        />

        {/* User Menu */}
        <UserMenu user={user} onLogout={onLogout} />
      </aside>

      {/* Main content */}
      <main className="lg:ml-[260px] pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
