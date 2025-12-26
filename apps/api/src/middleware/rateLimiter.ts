/**
 * Rate Limiting Middleware - Phase 2, Task 2.5
 * Implement rate limiting for sensitive endpoints
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for user registration
 * 10 requests per hour per IP
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many registration requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for family creation
 * 10 requests per hour per user (authenticated)
 */
export const familyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    const user = (req as any).user;
    return user?.auth0_id || req.ip || 'unknown';
  },
  message: 'Too many family creation requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for creating invitations
 * 20 requests per day per user
 */
export const invitationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 20,
  keyGenerator: (req) => {
    const user = (req as any).user;
    return user?.auth0_id || req.ip || 'unknown';
  },
  message: 'Too many invitation requests, please try again tomorrow',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for resending invitations
 * 10 requests per day per user
 */
export const resendLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 10,
  keyGenerator: (req) => {
    const user = (req as any).user;
    return user?.auth0_id || req.ip || 'unknown';
  },
  message: 'Too many resend requests, please try again tomorrow',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for transferring admin
 * 5 requests per day per user
 */
export const transferAdminLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 5,
  keyGenerator: (req) => {
    const user = (req as any).user;
    return user?.auth0_id || req.ip || 'unknown';
  },
  message: 'Too many admin transfer requests, please try again tomorrow',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for invitation preview
 * 30 requests per minute per IP (public, unauthenticated)
 */
export const previewLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many preview requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for accepting invitations
 * 10 requests per hour per user
 */
export const acceptLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => {
    const user = (req as any).user;
    return user?.auth0_id || req.ip || 'unknown';
  },
  message: 'Too many acceptance requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for JWT validation failures
 * 10 failures per minute per IP
 */
export const jwtFailureLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  keyGenerator: (req) => req.ip || 'unknown',
  message: 'Too many authentication failures, please try again later',
  skip: (req) => {
    // Skip if request has valid user context
    return !!(req as any).user;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 * 100 requests per minute per IP (baseline)
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
