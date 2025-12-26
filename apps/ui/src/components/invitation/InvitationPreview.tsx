/**
 * Task 8.5: Invitation preview component (public, no auth)
 * Display invitation preview before signup/login with family info and inviting parent
 * See: spec.md "Invitation Preview Component" (lines 1112-1117)
 */

import { useEffect, useState } from 'react'
import { useSearch, Link } from '@tanstack/react-router'
import { apiClient } from '@/lib/api-client'
import { InvitationPreviewResponse } from '@/types'

interface InviteSearch {
  token: string
}

export function InvitationPreview() {
  const search = useSearch({ from: '/invite/$token' }) as InviteSearch
  const [invitationData, setInvitationData] = useState<InvitationPreviewResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get<InvitationPreviewResponse>(
          `/v1/invitations/${search.token}/preview`
        )
        setInvitationData(response)
      } catch (err) {
        const errorMessage = apiClient.getErrorMessage(err)
        // Check if it's an expiration error (410)
        if (errorMessage.includes('expired') || errorMessage.includes('not found')) {
          setError(
            'This invitation link has expired or is invalid. Please ask the admin parent to resend an invitation.'
          )
        } else {
          setError(errorMessage)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitation()
  }, [search.token])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 to-harbor-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-harbor-600"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error || !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 to-harbor-50 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invitation Invalid</h1>
          <p className="text-gray-700 mb-6">{error || 'Unable to load invitation.'}</p>
          <Link
            to="/login"
            className="block w-full py-2 px-4 bg-harbor-600 text-white font-semibold rounded text-center hover:bg-harbor-700 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  const { family, children, inviting_parent } = invitationData

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-harbor-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-harbor-900 mb-2">You're Invited!</h1>
          <p className="text-gray-600 mb-8">
            {inviting_parent.name} has invited you to join the <strong>{family.name}</strong> family on CoParent
          </p>

          {/* Inviting Parent Info */}
          <div className="mb-8 p-4 bg-harbor-50 rounded-lg">
            <div className="flex items-center gap-4">
              {inviting_parent.avatar_url && (
                <img
                  src={inviting_parent.avatar_url}
                  alt={inviting_parent.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">{inviting_parent.name}</p>
                <p className="text-sm text-gray-600">Family Admin</p>
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h3>
            <div className="space-y-3">
              {children.map((child) => (
                <div key={child.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <div className="text-2xl">👶</div>
                  <div>
                    <p className="font-medium text-gray-900">{child.name}</p>
                    <p className="text-sm text-gray-600">
                      Born {new Date(child.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/signup"
              search={{ inviteEmail: invitationData.invitation.email, token: search.token }}
              className="block w-full py-3 px-4 bg-harbor-600 text-white font-semibold rounded-lg hover:bg-harbor-700 text-center transition"
            >
              Create Account
            </Link>

            <Link
              to="/login"
              className="block w-full py-3 px-4 border border-harbor-300 text-harbor-600 font-semibold rounded-lg hover:bg-harbor-50 text-center transition"
            >
              Log In Instead
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            This invitation link expires in 7 days
          </p>
        </div>
      </div>
    </div>
  )
}
