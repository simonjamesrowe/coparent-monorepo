/**
 * MSW handlers for API mocking in tests
 * See: spec.md "Testing Strategy" (lines 1408-1539)
 */

import { http, HttpResponse } from 'msw'
import { MeResponse, RegisterResponse, FamilyCreateResponse, InvitationCreateResponse, InvitationPreviewResponse } from '@/types'

const apiUrl = 'http://localhost:3001/api'

export const handlers = [
  // POST /api/v1/users/register
  http.post(`${apiUrl}/v1/users/register`, async ({ request }) => {
    const body = await request.json() as any

    if (!body.auth0_id || !body.email) {
      return HttpResponse.json({
        error: 'validation_error',
        message: 'Missing required fields',
      }, { status: 400 })
    }

    return HttpResponse.json({
      user: {
        id: 'user-1',
        auth0_id: body.auth0_id,
        email: body.email,
        name: body.name,
        avatar_url: body.avatar_url,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      family: null,
      needs_family_setup: true,
      role: undefined,
    } as RegisterResponse)
  }),

  // GET /api/v1/users/me
  http.get(`${apiUrl}/v1/users/me`, () => {
    return HttpResponse.json({
      user: {
        id: 'user-1',
        auth0_id: 'auth0|test',
        email: 'test@example.com',
        name: 'Test User',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      family: {
        id: 'family-1',
        name: 'Test Family',
        created_by_user_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      role: 'ADMIN_PARENT',
      joined_at: new Date().toISOString(),
    } as MeResponse)
  }),

  // POST /api/v1/families
  http.post(`${apiUrl}/v1/families`, async ({ request }) => {
    const body = await request.json() as any

    if (!body.name || !body.children || body.children.length === 0) {
      return HttpResponse.json({
        error: 'validation_error',
        message: 'Family name and children required',
      }, { status: 400 })
    }

    return HttpResponse.json({
      family: {
        id: 'family-1',
        name: body.name,
        created_by_user_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      children: body.children.map((child: any, idx: number) => ({
        id: `child-${idx}`,
        family_id: 'family-1',
        name: child.name,
        date_of_birth: child.date_of_birth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
      parent: {
        id: 'parent-1',
        user_id: 'user-1',
        family_id: 'family-1',
        role: 'ADMIN_PARENT',
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    } as FamilyCreateResponse)
  }),

  // POST /api/v1/invitations
  http.post(`${apiUrl}/v1/invitations`, async ({ request }) => {
    const body = await request.json() as any

    if (!body.email) {
      return HttpResponse.json({
        error: 'validation_error',
        message: 'Email required',
      }, { status: 400 })
    }

    return HttpResponse.json({
      invitation: {
        id: 'invitation-1',
        family_id: 'family-1',
        inviting_parent_id: 'parent-1',
        email: body.email,
        token: 'test-token-123',
        status: 'PENDING',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      invitation_url: `http://localhost:3000/invite/test-token-123`,
    } as InvitationCreateResponse)
  }),

  // GET /api/v1/invitations/{token}/preview
  http.get(`${apiUrl}/v1/invitations/:token/preview`, ({ params }) => {
    const { token } = params

    if (token === 'expired-token') {
      return HttpResponse.json({
        error: 'invitation_expired',
        message: 'This invitation link has expired',
      }, { status: 410 })
    }

    return HttpResponse.json({
      invitation: {
        id: 'invitation-1',
        family_id: 'family-1',
        email: 'coparent@example.com',
        status: 'PENDING',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      family: {
        id: 'family-1',
        name: 'Test Family',
        created_by_user_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      children: [
        {
          id: 'child-1',
          name: 'Test Child',
          date_of_birth: '2015-01-01',
        },
      ],
      inviting_parent: {
        id: 'parent-1',
        name: 'Test User',
        avatar_url: undefined,
      },
    } as InvitationPreviewResponse)
  }),

  // POST /api/v1/invitations/{token}/accept
  http.post(`${apiUrl}/v1/invitations/:token/accept`, () => {
    return HttpResponse.json({
      invitation: {
        id: 'invitation-1',
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: 'user-2',
      },
      family: {
        id: 'family-1',
        name: 'Test Family',
        created_at: new Date().toISOString(),
      },
      parent: {
        id: 'parent-2',
        user_id: 'user-2',
        family_id: 'family-1',
        role: 'CO_PARENT',
        joined_at: new Date().toISOString(),
      },
    })
  }),

  // PUT /api/v1/families/{id}/transfer-admin
  http.put(`${apiUrl}/v1/families/:id/transfer-admin`, () => {
    return HttpResponse.json({
      family: {
        id: 'family-1',
        name: 'Test Family',
      },
      previous_admin: {
        id: 'parent-1',
        user_id: 'user-1',
        role: 'CO_PARENT',
      },
      new_admin: {
        id: 'parent-2',
        user_id: 'user-2',
        role: 'ADMIN_PARENT',
      },
      transfer_timestamp: new Date().toISOString(),
    })
  }),
]
