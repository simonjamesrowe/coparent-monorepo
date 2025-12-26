/**
 * Task 9.2: App initialization with user context restoration
 * On app load, fetch current user context and restore Zustand store
 * See: spec.md lines 818-826
 */

import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './routes'
import { apiClient } from '@/lib/api-client'
import { useFamilyStore } from '@/stores/familyStore'
import { MeResponse } from '@/types'

function App() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const {
    setUser,
    setFamily,
    setRole,
    setIsAuthenticated: setStoreAuthenticated,
    setIsLoading,
  } = useFamilyStore()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if JWT exists in SessionStorage
        const token = sessionStorage.getItem('access_token')

        if (!isAuthenticated || !token) {
          // No authentication
          setStoreAuthenticated(false)
          setIsLoading(false)
          return
        }

        // Get fresh token from Auth0
        const freshToken = await getAccessTokenSilently()
        apiClient.setToken(freshToken)
        setStoreAuthenticated(true)

        // Call GET /api/v1/users/me to restore context
        const userContext = await apiClient.get<MeResponse>('/v1/users/me')

        setUser(userContext.user)
        setRole(userContext.role || null)

        if (userContext.family) {
          setFamily(userContext.family)
        }
      } catch (err) {
        console.error('App initialization error:', err)
        // Clear any invalid tokens
        apiClient.clearToken()
        setStoreAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [isAuthenticated, getAccessTokenSilently, setUser, setFamily, setRole, setStoreAuthenticated, setIsLoading])

  return <RouterProvider router={router} />
}

export default App
