import jwt from 'jsonwebtoken';

const TEST_SECRET = process.env.E2E_TEST_JWT_SECRET ?? 'e2e-test-secret';

export interface TestJwtOverrides {
  sub?: string;
  email?: string;
  permissions?: string[];
  expiresIn?: string | number;
}

export function signTestJwt(overrides: TestJwtOverrides = {}): string {
  return jwt.sign(
    {
      sub: overrides.sub ?? 'e2e-test|user-1',
      email: overrides.email ?? 'e2e-test@coparent.dev',
      permissions: overrides.permissions ?? [],
    },
    TEST_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: overrides.expiresIn ?? '1h',
    },
  );
}
