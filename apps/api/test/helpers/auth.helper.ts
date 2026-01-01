/**
 * Auth0 Test Helper
 *
 * This helper provides methods to obtain Auth0 access tokens for e2e testing.
 * It uses Machine-to-Machine (M2M) credentials to get tokens.
 *
 * Required environment variables:
 * - AUTH0_DOMAIN: Your Auth0 tenant domain
 * - AUTH0_CLIENT_ID: M2M application client ID
 * - AUTH0_CLIENT_SECRET: M2M application client secret
 * - AUTH0_AUDIENCE: API audience identifier
 */

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get an Auth0 access token for testing
 * Uses caching to avoid hitting Auth0 rate limits
 */
export async function getTestToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;
  const audience = process.env.AUTH0_AUDIENCE;

  if (!domain || !clientId || !clientSecret || !audience) {
    throw new Error(
      'Missing Auth0 configuration. Please set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, and AUTH0_AUDIENCE environment variables.',
    );
  }

  const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Auth0 token: ${error}`);
  }

  const data: TokenResponse = await response.json();

  // Cache the token with a 5-minute buffer before expiry
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return cachedToken;
}

/**
 * Clear the cached token (useful between test suites)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiry = 0;
}

/**
 * Create a mock user object for testing (when Auth0 is not available)
 */
export function createMockUser(overrides?: Partial<TestUser>): TestUser {
  return {
    auth0Id: 'auth0|test-user-123',
    email: 'test@coparent.dev',
    permissions: [],
    ...overrides,
  };
}

export interface TestUser {
  auth0Id: string;
  email: string;
  permissions: string[];
}
