/**
 * Task 7.5: Route guards and protected routes
 * Route guard middleware to prevent access to authenticated pages without valid JWT
 * See: spec.md "Route Guards and Auth Protection" (lines 1180-1227)
 */

import { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useFamily } from '@/stores/familyStore'

interface ProtectedRouteProps {
  children: ReactNode
  requireFamily?: boolean
  requireAdmin?: boolean
}

export function ProtectedRoute({
  children,
  requireFamily = true,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const navigate = useNavigate()
  const { isAuthenticated, family, isAdmin, isLoading } = useFamily()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-harbor-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    navigate({ to: '/login' })
    return null
  }

  if (requireFamily && !family) {
    navigate({ to: '/family/setup' })
    return null
  }

  if (requireAdmin && !isAdmin) {
    navigate({ to: '/dashboard' })
    return null
  }

  return <>{children}</>
}

/**
 * Hook for checking if current user can access a route
 */
export function useCanAccess(requireFamily: boolean = true, requireAdmin: boolean = false): boolean {
  const { isAuthenticated, family, isAdmin } = useFamily()

  if (!isAuthenticated) {
    return false
  }

  if (requireFamily && !family) {
    return false
  }

  if (requireAdmin && !isAdmin) {
    return false
  }

  return true
}
