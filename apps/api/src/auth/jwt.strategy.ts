import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: process.env.AUTH0_AUDIENCE,
      issuer: process.env.AUTH0_ISSUER,
      algorithms: ['RS256'],
    });
  }

  validate(payload: Record<string, unknown>) {
    const auth0Id = (payload.sub as string | undefined) ?? 'unknown';
    const email =
      (payload.email as string | undefined) ?? `${auth0Id.replace(/\|/g, '_')}@coparent.dev`;

    return {
      auth0Id,
      email,
      permissions: payload.permissions,
    };
  }
}
