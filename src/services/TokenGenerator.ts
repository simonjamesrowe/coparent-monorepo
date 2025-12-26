/**
 * Token Generator Service - Phase 5, Task 5.2
 * Generates unique, URL-safe, non-guessable invitation tokens
 */

import { randomBytes } from 'crypto';

export class TokenGenerator {
  /**
   * Generate a unique, URL-safe invitation token
   * Uses cryptographically secure random bytes
   * Format: base64url-encoded 32 bytes = 43 characters
   */
  static generateInvitationToken(): string {
    // Generate 32 random bytes
    const bytes = randomBytes(32);

    // Convert to base64url (URL-safe)
    return bytes
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Validate token format
   * Must be URL-safe alphanumeric + dash + underscore
   */
  static isValidTokenFormat(token: string): boolean {
    // Check if token is URL-safe base64 format
    const tokenRegex = /^[A-Za-z0-9_-]{43}$/;
    return tokenRegex.test(token);
  }

  /**
   * Generate expiration date (7 days from now)
   */
  static generateExpirationDate(days: number = 7): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}
