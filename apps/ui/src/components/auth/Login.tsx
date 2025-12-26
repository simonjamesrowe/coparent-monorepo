/**
 * Task 7.2: Login component
 * Login page with "Log In" and "Log In with Google" buttons, error handling, loading states
 * See: spec.md "Login Component" (lines 1084-1089) and Flow 3 (lines 81-94)
 */

import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link } from '@tanstack/react-router'

export function Login() {
  const { loginWithRedirect, isLoading, error } = useAuth0()
  const [isLogginIn, setIsLoginIn] = useState(false)

  const handleLogin = async () => {
    setIsLoginIn(true)
    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'login',
        },
      })
    } catch (err) {
      console.error('Login failed:', err)
      setIsLoginIn(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoginIn(true)
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection: 'google-oauth2',
          screen_hint: 'login',
        },
      })
    } catch (err) {
      console.error('Google login failed:', err)
      setIsLoginIn(false)
    }
  }

  const handleForgotPassword = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
        },
      })
    } catch (err) {
      console.error('Password reset failed:', err)
    }
  }

  const isDisabled = isLoading || isLogginIn

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 to-harbor-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-harbor-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 mb-8">Sign in to your CoParent account</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <p className="font-semibold">Login Failed</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={isDisabled}
              className="w-full py-3 px-4 bg-harbor-600 text-white font-semibold rounded-lg hover:bg-harbor-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLogginIn ? 'Logging In...' : 'Log In with Email'}
            </button>

            <button
              onClick={handleGoogleLogin}
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
              {isLogginIn ? 'Signing In...' : 'Log In with Google'}
            </button>
          </div>

          <div className="mt-6 border-t pt-6">
            <button
              onClick={handleForgotPassword}
              disabled={isDisabled}
              className="w-full text-center text-harbor-600 hover:text-harbor-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Forgot Password?
            </button>
          </div>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-harbor-600 hover:text-harbor-700 font-semibold"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
