/**
 * Task 7.4: Auth Callback component
 * Handle redirect from Auth0 after login/signup, exchange auth code for JWT, sync user to backend
 * See: spec.md "Auth Callback Component" (lines 1098-1103)
 */

import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from '@tanstack/react-router'
import { apiClient } from '@/lib/api-client'
import { useFamilyStore } from '@/stores/familyStore'
import { RegisterResponse } from '@/types'

export function AuthCallback() {
  const { isAuthenticated, user, getAccessTokenSilently, logout } = useAuth0()
  const navigate = useNavigate()
  const { setUser, setFamily, setRole, setIsAuthenticated } = useFamilyStore()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!isAuthenticated || !user) {
          setError('Authentication failed. Please try again.')
          setIsProcessing(false)
          return
        }

        // Get access token from Auth0
        const token = await getAccessTokenSilently()

        // Store JWT in SessionStorage (not LocalStorage)
        apiClient.setToken(token)
        setIsAuthenticated(true)

        // Call POST /api/v1/users/register to sync user
        const response = await apiClient.post<RegisterResponse>('/v1/users/register', {
          auth0_id: user.sub,
          email: user.email,
          name: user.name || user.email,
          avatar_url: user.picture,
        })

        // Update Zustand store
        setUser(response.user)
        setRole(response.role || null)

        if (response.family) {
          setFamily(response.family)
        }

        // Redirect based on needs_family_setup flag
        if (response.needs_family_setup) {
          navigate({ to: '/family/setup' })
        } else {
          navigate({ to: '/dashboard' })
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError(apiClient.getErrorMessage(err))

        // Clear token and logout if registration fails
        apiClient.clearToken()
        await logout({ logoutParams: { returnTo: window.location.origin } })
      } finally {
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [isAuthenticated, user, getAccessTokenSilently, navigate, setUser, setFamily, setRole, setIsAuthenticated, logout])

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 to-harbor-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-harbor-600"></div>
          <p className="mt-4 text-gray-600">Setting up your account...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 to-harbor-50 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Login Failed</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate({ to: '/login' })}
            className="w-full py-2 px-4 bg-harbor-600 text-white font-semibold rounded hover:bg-harbor-700 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return null
}
