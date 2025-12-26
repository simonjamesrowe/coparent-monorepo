/**
 * Task 8.4: Invitation accept component
 * Handle acceptance of invitation after user signup/login
 * See: spec.md "Invitation Accept Component" (lines 1119-1125)
 */

import { useEffect, useState } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { apiClient } from '@/lib/api-client'
import { useFamilyStore } from '@/stores/familyStore'
import { InvitationAcceptResponse } from '@/types'

interface InviteSearch {
  token: string
}

export function InvitationAccept() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/invite/$token/accept' }) as InviteSearch
  const { isAuthenticated, user } = useAuth0()
  const { setFamily, setRole } = useFamilyStore()
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const acceptInvitation = async () => {
      try {
        if (!isAuthenticated || !user) {
          setError('You must be logged in to accept an invitation.')
          setIsProcessing(false)
          return
        }

        setIsAccepting(true)
        const response = await apiClient.post<InvitationAcceptResponse>(
          `/v1/invitations/${search.token}/accept`,
          { token: search.token }
        )

        // Update store with family and role
        setFamily(response.family)
        setRole(response.parent.role)

        // Show success and redirect
        navigate({ to: '/dashboard' })
      } catch (err) {
        const errorMessage = apiClient.getErrorMessage(err)
        setError(errorMessage)
      } finally {
        setIsAccepting(false)
        setIsProcessing(false)
      }
    }

    acceptInvitation()
  }, [isAuthenticated, user, search.token, navigate, setFamily, setRole])

  if (isProcessing || isAccepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 to-harbor-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-harbor-600"></div>
          <p className="mt-4 text-gray-600">Accepting invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 to-harbor-50 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invitation Accept Failed</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="w-full py-2 px-4 bg-harbor-600 text-white font-semibold rounded hover:bg-harbor-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return null
}
