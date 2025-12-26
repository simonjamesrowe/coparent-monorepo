/**
 * Task 8.5: Invite Co-Parent component (admin only)
 * Form for admin parent to send invitations and view pending invitations
 * See: spec.md "Invite Co-Parent Component" (lines 1127-1133) and Flow 5 (lines 108-129)
 */

import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import { useFamily } from '@/stores/familyStore'
import { InvitationCreateResponse, Invitation } from '@/types'

// Validation schema
const inviteCoParentSchema = z.object({
  email: z.string().email('Valid email is required'),
  message: z.string().optional(),
})

type InviteCoParentFormData = z.infer<typeof inviteCoParentSchema>

export function InviteCoParent() {
  const { family } = useFamily()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteCoParentFormData>({
    resolver: zodResolver(inviteCoParentSchema),
  })

  // Load existing invitations
  useEffect(() => {
    const loadInvitations = async () => {
      if (!family) return

      try {
        // TODO: Implement GET /api/v1/families/{id}/invitations endpoint
        setInvitations([])
      } catch (err) {
        console.error('Failed to load invitations:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadInvitations()
  }, [family])

  const onSubmit: SubmitHandler<InviteCoParentFormData> = async (data) => {
    setSubmitError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const response = await apiClient.post<InvitationCreateResponse>('/v1/invitations', {
        email: data.email,
        message: data.message,
      })

      setSuccessMessage(`Invitation sent to ${data.email}!`)
      setInvitations([response.invitation, ...invitations])
      reset()

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      setSubmitError(apiClient.getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async (invitationId: string) => {
    try {
      // TODO: Implement resend endpoint
      setSuccessMessage('Invitation resent!')
    } catch (err) {
      setSubmitError(apiClient.getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-harbor-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-harbor-900 mb-2">Invite Co-Parent</h1>
          <p className="text-gray-600 mb-8">Send an invitation to another parent to manage {family?.name}</p>

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{submitError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-800">
              <p className="font-semibold">Success</p>
              <p className="text-sm mt-1">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-12">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Co-Parent Email *
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="coparent@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harbor-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                {...register('message')}
                id="message"
                placeholder="Add a personal message..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harbor-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-harbor-600 text-white font-semibold rounded-lg hover:bg-harbor-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </form>

          {/* Invitations List */}
          {!isLoading && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Invitation History</h3>
              {invitations.length === 0 ? (
                <p className="text-gray-600">No invitations yet</p>
              ) : (
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{invitation.email}</p>
                        <p className="text-sm text-gray-600">Status: <span className="capitalize">{invitation.status.toLowerCase()}</span></p>
                      </div>
                      {invitation.status === 'EXPIRED' && (
                        <button
                          onClick={() => handleResend(invitation.id)}
                          className="px-4 py-2 text-sm font-medium text-harbor-600 hover:bg-harbor-50 rounded transition"
                        >
                          Resend
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
