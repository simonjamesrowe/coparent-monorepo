/**
 * Task 7.6: Logout functionality
 * Clear JWT from SessionStorage, clear Zustand store, redirect to login
 * See: Task 9.4 "Implement logout functionality"
 */

import { useAuth0 } from '@auth0/auth0-react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/stores/familyStore'

export function LogoutButton({ className = '' }: { className?: string }) {
  const { logout } = useAuth0()
  const { clearContext } = useAuth()

  const handleLogout = async () => {
    try {
      // Clear JWT from SessionStorage
      apiClient.clearToken()

      // Clear Zustand store
      clearContext()

      // Logout from Auth0
      await logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      })
    } catch (err) {
      console.error('Logout failed:', err)
      // Clear local state anyway
      apiClient.clearToken()
      clearContext()
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        'px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition'
      }
    >
      Log Out
    </button>
  )
}
