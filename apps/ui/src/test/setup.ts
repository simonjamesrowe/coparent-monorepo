import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

// Mock Auth0 globally to prevent actual auth attempts in tests
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      sub: 'auth0|test-user',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
    },
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
    getIdTokenClaims: vi.fn(),
    getAccessToken: vi.fn().mockResolvedValue('test-token'),
    error: null,
  })),
  Auth0Provider: ({ children }: any) => children,
}))

// Setup MSW server for API mocking
export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close())
