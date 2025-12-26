/**
 * Dashboard page
 * Main page after authentication showing family overview
 */

import { Link } from '@tanstack/react-router'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { useFamily, useUser } from '@/stores/familyStore'

export function Dashboard() {
  const { user } = useUser()
  const { family, isAdmin } = useFamily()

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-harbor-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-harbor-900">CoParent</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-harbor-900 mb-2">Welcome, {user?.name}!</h2>
          <p className="text-gray-600">
            You are managing <strong>{family?.name}</strong>
          </p>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Admin Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/family/invite"
                className="p-4 border border-harbor-300 rounded-lg hover:bg-harbor-50 transition font-medium text-harbor-600"
              >
                Invite Co-Parent
              </Link>
              <Link
                to="/family/transfer-admin"
                className="p-4 border border-harbor-300 rounded-lg hover:bg-harbor-50 transition font-medium text-harbor-600"
              >
                Transfer Admin Privileges
              </Link>
            </div>
          </div>
        )}

        {/* Family Info */}
        {family && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Family Name</p>
                <p className="text-lg font-medium text-gray-900">{family.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-medium text-gray-900">
                  {isAdmin ? 'Admin Parent' : 'Co-Parent'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
