/**
 * Task 7.3: Signup component
 * Signup page with "Sign Up" and "Sign Up with Google" buttons, error handling, loading states
 * See: spec.md "Signup Component" (lines 1091-1096)
 */

import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useSearch, Link } from '@tanstack/react-router'

interface SignupSearch {
  inviteEmail?: string
  token?: string
}

export function Signup() {
  const { loginWithRedirect, isLoading, error } = useAuth0()
  const [isSigningUp, setIsSigningUp] = useState(false)
  const search = useSearch({ from: '/signup' }) as SignupSearch

  const handleSignup = async () => {
    setIsSigningUp(true)
    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          login_hint: search.inviteEmail,
        },
      })
    } catch (err) {
      console.error('Signup failed:', err)
      setIsSigningUp(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsSigningUp(true)
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection: 'google-oauth2',
          screen_hint: 'signup',
          login_hint: search.inviteEmail,
        },
      })
    } catch (err) {
      console.error('Google signup failed:', err)
      setIsSigningUp(false)
    }
  }

  const isDisabled = isLoading || isSigningUp

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 to-harbor-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-harbor-900 mb-2">Create Account</h1>
          <p className="text-gray-600 mb-8">Join CoParent to manage family schedules and expenses</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <p className="font-semibold">Signup Failed</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          )}

          {search.token && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded text-blue-800">
              <p className="text-sm">
                You're signing up to join a family. Your email <strong>{search.inviteEmail}</strong> will be used.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleSignup}
              disabled={isDisabled}
              className="w-full py-3 px-4 bg-harbor-600 text-white font-semibold rounded-lg hover:bg-harbor-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSigningUp ? 'Creating Account...' : 'Sign Up with Email'}
            </button>

            <button
              onClick={handleGoogleSignup}
              disabled={isDisabled}
              className="w-full py-3 px-4 bg-white text-gray-800 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isSigningUp ? 'Signing Up...' : 'Sign Up with Google'}
            </button>
          </div>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-harbor-600 hover:text-harbor-700 font-semibold"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
