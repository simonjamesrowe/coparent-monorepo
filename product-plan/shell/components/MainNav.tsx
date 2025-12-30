'use client'

import { Settings } from 'lucide-react'
import type { NavigationItem } from './AppShell'

interface MainNavProps {
  items: NavigationItem[]
  onNavigate?: (href: string) => void
}

export function MainNav({ items, onNavigate }: MainNavProps) {
  // Separate settings from main items
  const mainItems = items.filter(
    (item) => item.label.toLowerCase() !== 'settings'
  )
  const settingsItem = items.find(
    (item) => item.label.toLowerCase() === 'settings'
  )

  return (
    <nav className="flex-1 flex flex-col px-4 py-6">
      {/* Main section label */}
      <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Main
      </div>

      {/* Main navigation items */}
      <div className="space-y-1">
        {mainItems.map((item) => (
          <button
            key={item.href}
            onClick={() => onNavigate?.(item.href)}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg
              text-sm font-medium transition-all duration-200
              ${
                item.isActive
                  ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50'
              }
            `}
          >
            {item.icon && (
              <span className="w-5 h-5 flex items-center justify-center">
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings section */}
      {settingsItem && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onNavigate?.(settingsItem.href)}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg
              text-sm font-medium transition-all duration-200
              ${
                settingsItem.isActive
                  ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50'
              }
            `}
          >
            {settingsItem.icon || <Settings className="w-5 h-5" />}
            {settingsItem.label}
          </button>
        </div>
      )}
    </nav>
  )
}
