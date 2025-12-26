/**
 * Invitation Model - Task 5.1
 * Email-based parent invitations with 7-day expiring tokens
 * Query-time isolation: All queries must include family_id
 */

import { query } from '../db/connection';
import { Invitation, InvitationStatus } from '../types';
import logger from '../utils/logger';

export class InvitationModel {
  /**
   * Create an invitation record
   * PARTITION KEY: family_id
   */
  static async create(
    family_id: string,
    inviting_parent_id: string,
    email: string,
    token: string,
    expires_at: Date
  ): Promise<Invitation> {
    // Validation
    if (!family_id || !inviting_parent_id || !email || !token || !expires_at) {
      throw new Error('All fields are required');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    try {
      const result = await query(
        `INSERT INTO invitations (family_id, inviting_parent_id, email, token, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [family_id, inviting_parent_id, email.toLowerCase(), token, 'PENDING', expires_at]
      );

      logger.info('Invitation created', {
        invitation_id: result.rows[0].id,
        family_id,
        email,
      });

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'invitations_token_key') {
        throw new Error('Token already exists');
      }
      logger.error('Failed to create invitation', { error, family_id, email });
      throw error;
    }
  }

  /**
   * Find invitation by token
   * No partition key in preview endpoint (public, unauthenticated)
   */
  static async findByToken(token: string): Promise<Invitation | null> {
    try {
      const result = await query(
        'SELECT * FROM invitations WHERE token = $1',
        [token]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find invitation by token', { error, token });
      throw error;
    }
  }

  /**
   * Find invitation by ID
   * PARTITION KEY: family_id MUST be included for isolation
   */
  static async findById(invitation_id: string, family_id: string): Promise<Invitation | null> {
    try {
      const result = await query(
        'SELECT * FROM invitations WHERE id = $1 AND family_id = $2',
        [invitation_id, family_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find invitation by ID', { error, invitation_id, family_id });
      throw error;
    }
  }

  /**
   * Get all invitations for a family
   * PARTITION KEY: family_id MUST be included
   */
  static async getAllByFamily(family_id: string, status?: InvitationStatus): Promise<Invitation[]> {
    let sql = 'SELECT * FROM invitations WHERE family_id = $1';
    const params = [family_id];

    if (status) {
      sql += ' AND status = $2';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    try {
      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get invitations by family', { error, family_id });
      throw error;
    }
  }

  /**
   * Check if email has already been invited to this family
   * PARTITION KEY: family_id MUST be included
   */
  static async emailExists(family_id: string, email: string): Promise<boolean> {
    try {
      const result = await query(
        'SELECT COUNT(*) FROM invitations WHERE family_id = $1 AND email = $2',
        [family_id, email.toLowerCase()]
      );
      return parseInt(result.rows[0].count, 10) > 0;
    } catch (error) {
      logger.error('Failed to check email existence', { error, family_id, email });
      throw error;
    }
  }

  /**
   * Check for pending invitation to email in family
   * PARTITION KEY: family_id MUST be included
   */
  static async pendingExists(family_id: string, email: string): Promise<boolean> {
    try {
      const result = await query(
        'SELECT COUNT(*) FROM invitations WHERE family_id = $1 AND email = $2 AND status = $3',
        [family_id, email.toLowerCase(), 'PENDING']
      );
      return parseInt(result.rows[0].count, 10) > 0;
    } catch (error) {
      logger.error('Failed to check pending invitation', { error, family_id, email });
      throw error;
    }
  }

  /**
   * Update invitation status
   * PARTITION KEY: family_id MUST be included
   */
  static async updateStatus(
    invitation_id: string,
    family_id: string,
    status: InvitationStatus,
    accepted_by_user_id?: string
  ): Promise<Invitation> {
    try {
      let sql =
        'UPDATE invitations SET status = $1';
      const params: any[] = [status];
      let paramCount = 2;

      if (status === 'ACCEPTED' && accepted_by_user_id) {
        sql += `, accepted_at = NOW(), accepted_by_user_id = $${paramCount++}`;
        params.push(accepted_by_user_id);
      }

      sql += ` WHERE id = $${paramCount++} AND family_id = $${paramCount} RETURNING *`;
      params.push(invitation_id);
      params.push(family_id);

      const result = await query(sql, params);

      if (result.rows.length === 0) {
        throw new Error('Invitation not found');
      }

      logger.info('Invitation status updated', {
        invitation_id,
        family_id,
        status,
      });

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update invitation status', {
        error,
        invitation_id,
        family_id,
      });
      throw error;
    }
  }

  /**
   * Mark invitation as expired
   * Used by background job
   */
  static async markExpired(invitation_id: string): Promise<Invitation | null> {
    try {
      const result = await query(
        'UPDATE invitations SET status = $1 WHERE id = $2 AND status = $3 RETURNING *',
        ['EXPIRED', invitation_id, 'PENDING']
      );

      if (result.rows.length > 0) {
        logger.info('Invitation marked expired', { invitation_id });
      }

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to mark invitation expired', { error, invitation_id });
      throw error;
    }
  }

  /**
   * Revoke invitation (mark as REVOKED when resending)
   */
  static async revoke(invitation_id: string): Promise<void> {
    try {
      await query(
        'UPDATE invitations SET status = $1 WHERE id = $2',
        ['REVOKED', invitation_id]
      );

      logger.info('Invitation revoked', { invitation_id });
    } catch (error) {
      logger.error('Failed to revoke invitation', { error, invitation_id });
      throw error;
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
