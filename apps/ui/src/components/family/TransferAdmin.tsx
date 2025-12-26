/**
 * Task 8.6: Transfer Admin component (admin only)
 * UI for admin to transfer admin privileges to co-parent
 * See: spec.md "Admin Transfer Component" (lines 1135-1140) and Flow 9 (lines 210-232)
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { apiClient } from '@/lib/api-client'
import { useFamily } from '@/stores/familyStore'
import { TransferAdminResponse } from '@/types'

interface CoParent {
  id: string
  name: string
  email: string
}

export function TransferAdmin() {
  const navigate = useNavigate()
  const { family } = useFamily()
  const [coParents] = useState<CoParent[]>([])
  const [selectedCoParent, setSelectedCoParent] = useState<CoParent | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!family) {
    return null
  }

  const handleConfirmTransfer = async () => {
    if (!selectedCoParent) return

    setIsTransferring(true)
    setError(null)

    try {
      await apiClient.put<TransferAdminResponse>(
        `/v1/families/${family.id}/transfer-admin`,
        { target_user_id: selectedCoParent.id }
      )

      // Show success and redirect (role will update on next fetch from /me endpoint)
      setShowConfirmation(false)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(apiClient.getErrorMessage(err))
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-harbor-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-harbor-900 mb-2">Transfer Admin Privileges</h1>
          <p className="text-gray-600 mb-8">
            You can transfer your admin privileges to another co-parent. Once transferred, you will become a co-parent.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Co-Parents List */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Co-Parent</h3>
            {coParents.length === 0 ? (
              <p className="text-gray-600">No co-parents to transfer to. Invite a co-parent first.</p>
            ) : (
              <div className="space-y-2">
                {coParents.map((coParent) => (
                  <button
                    key={coParent.id}
                    onClick={() => setSelectedCoParent(coParent)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedCoParent?.id === coParent.id
                        ? 'border-harbor-600 bg-harbor-50'
                        : 'border-gray-200 hover:border-harbor-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{coParent.name}</p>
                    <p className="text-sm text-gray-600">{coParent.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={!selectedCoParent || isTransferring}
            className="w-full py-3 px-4 bg-harbor-600 text-white font-semibold rounded-lg hover:bg-harbor-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isTransferring ? 'Transferring...' : 'Transfer Admin Privileges'}
          </button>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && selectedCoParent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Transfer?</h2>
              <p className="text-gray-700 mb-6">
                Transfer admin privileges to <strong>{selectedCoParent.name}</strong>? You will become a co-parent
                and will no longer be able to manage family settings or send invitations.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTransfer}
                  disabled={isTransferring}
                  className="flex-1 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isTransferring ? 'Transferring...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
