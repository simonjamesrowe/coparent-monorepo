import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class TestJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      secretOrKey: process.env.E2E_TEST_JWT_SECRET ?? 'e2e-test-secret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['HS256'],
    });
  }

  validate(payload: Record<string, unknown>) {
    const auth0Id = (payload.sub as string | undefined) ?? 'unknown';
    const email =
      (payload.email as string | undefined) ?? `${auth0Id.replace(/\|/g, '_')}@coparent.dev`;

    return {
      auth0Id,
      email,
      permissions: (payload.permissions as string[] | undefined) ?? [],
    };
  }
}
