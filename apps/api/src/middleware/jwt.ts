/**
 * JWT Validation Middleware - Phase 2, Task 2.2
 * Validates Auth0 JWT tokens and extracts user context
 */

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import logger from '../utils/logger';
import { JWTClaims, UserContext } from '../types';

interface CachedPublicKey {
  key: string;
  expires_at: number;
}

const publicKeyCache: Map<string, CachedPublicKey> = new Map();
const PUBLIC_KEY_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch and cache Auth0 public keys
 */
async function getAuth0PublicKey(): Promise<string> {
  const auth0Domain = process.env.AUTH0_DOMAIN;
  if (!auth0Domain) {
    throw new Error('AUTH0_DOMAIN environment variable not set');
  }

  // Check cache first
  const cached = publicKeyCache.get(auth0Domain);
  if (cached && cached.expires_at > Date.now()) {
    return cached.key;
  }

  try {
    const response = await axios.get(`https://${auth0Domain}/.well-known/jwks.json`, {
      timeout: 5000,
    });

    // Get the first RSA key (typically there's only one signing key)
    const key = response.data.keys.find((k: any) => k.kty === 'RSA' && k.use === 'sig');
    if (!key) {
      throw new Error('No RSA signing key found in JWKS');
    }

    // Convert JWKS to PEM format
    const publicKey = await convertJwksToPem(key);

    // Cache the key
    publicKeyCache.set(auth0Domain, {
      key: publicKey,
      expires_at: Date.now() + PUBLIC_KEY_TTL,
    });

    return publicKey;
  } catch (error) {
    logger.error('Failed to fetch Auth0 public keys', error);
    throw error;
  }
}

/**
 * Convert JWKS to PEM format
 * Using jwk-to-pem library or manual conversion
 */
async function convertJwksToPem(jwk: any): Promise<string> {
  // Simplified: In production, use 'jwk-to-pem' package
  // This is a placeholder showing the concept
  const crypto = require('crypto');

  const n = Buffer.from(jwk.n, 'base64');
  const e = Buffer.from(jwk.e, 'base64');

  const publicKey = crypto.createPublicKey({
    key: { kty: 'RSA', n, e },
    format: 'jwk',
  });

  return publicKey.export({ format: 'pem', type: 'spki' });
}

/**
 * Validate JWT token middleware
 * Extracts auth0_id, email, and roles from token
 */
export async function validateJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'unauthorized',
        message: 'Missing or invalid Authorization header',
      });
      return;
    }

    const token = authHeader.substring(7);

    // Get Auth0 public key
    const publicKey = await getAuth0PublicKey();

    // Verify and decode token
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      audience: process.env.AUTH0_CLIENT_ID,
    }) as JWTClaims;

    // Extract user context from token
    const userContext: UserContext = {
      auth0_id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      roles: decoded[`${process.env.AUTH0_DOMAIN}/roles`] || [],
    };

    // Attach to request
    (req as any).user = userContext;

    logger.info('JWT validated', {
      auth0_id: userContext.auth0_id,
      email: userContext.email,
    });

    next();
  } catch (error: any) {
    logger.error('JWT validation failed', {
      error: error.message,
      ip: req.ip,
      path: req.path,
    });

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'token_expired',
        message: 'Token has expired',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'invalid_token',
        message: 'Invalid token',
      });
      return;
    }

    res.status(401).json({
      error: 'unauthorized',
      message: 'Invalid credentials',
    });
  }
}

/**
 * Extract user context from request (middleware assumes validation already passed)
 */
export function getUserContext(req: Request): UserContext {
  const user = (req as any).user;
  if (!user) {
    throw new Error('User context not found on request');
  }
  return user;
}

/**
 * Clear public key cache (for testing or manual refresh)
 */
export function clearPublicKeyCache(): void {
  publicKeyCache.clear();
  logger.info('Public key cache cleared');
}
