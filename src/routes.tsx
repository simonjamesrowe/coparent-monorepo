/**
 * Task 7.5: Route guards and protected routes
 * TanStack Router configuration with protected routes
 */

import { RootRoute, Route, Router } from '@tanstack/react-router'
import App from './App'
import { Login } from '@/components/auth/Login'
import { Signup } from '@/components/auth/Signup'
import { AuthCallback } from '@/components/auth/AuthCallback'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { FamilySetup } from '@/components/family/FamilySetup'
import { InvitationPreview } from '@/components/invitation/InvitationPreview'
import { InvitationAccept } from '@/components/invitation/InvitationAccept'
import { Dashboard } from '@/pages/Dashboard'
import { InviteCoParent } from '@/components/family/InviteCoParent'
import { TransferAdmin } from '@/components/family/TransferAdmin'

/**
 * Root route
 */
const rootRoute = new RootRoute({
  component: App,
})

/**
 * Public routes (no auth required)
 */
const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

const signupRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: Signup,
})

const authCallbackRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallback,
})

const invitationPreviewRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/invite/$token',
  component: InvitationPreview,
})

/**
 * Protected routes (auth required)
 */
const familySetupRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/family/setup',
  component: () => (
    <ProtectedRoute requireFamily={false}>
      <FamilySetup />
    </ProtectedRoute>
  ),
})

const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
})

const inviteCoParentRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/family/invite',
  component: () => (
    <ProtectedRoute requireAdmin={true}>
      <InviteCoParent />
    </ProtectedRoute>
  ),
})

const transferAdminRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/family/transfer-admin',
  component: () => (
    <ProtectedRoute requireAdmin={true}>
      <TransferAdmin />
    </ProtectedRoute>
  ),
})

/**
 * Invitation acceptance route (auth required)
 */
const invitationAcceptRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/invite/$token/accept',
  component: () => (
    <ProtectedRoute requireFamily={false}>
      <InvitationAccept />
    </ProtectedRoute>
  ),
})

/**
 * Create router
 */
const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  authCallbackRoute,
  invitationPreviewRoute,
  familySetupRoute,
  dashboardRoute,
  inviteCoParentRoute,
  transferAdminRoute,
  invitationAcceptRoute,
])

export const router = new Router({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
