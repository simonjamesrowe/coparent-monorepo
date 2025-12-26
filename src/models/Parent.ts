/**
 * Parent Model - Task 4.2
 * Represents user-family relationship with roles (ADMIN_PARENT, CO_PARENT)
 * Query-time isolation: All queries must include family_id
 */

import { query } from '../db/connection';
import { Parent, ParentRole } from '../types';
import logger from '../utils/logger';

export class ParentModel {
  /**
   * Create a parent record
   * Establishes user-family relationship with role
   */
  static async create(
    user_id: string,
    family_id: string,
    role: ParentRole,
    invited_by_user_id?: string,
    invited_at?: Date,
    joined_at?: Date
  ): Promise<Parent> {
    // Validation
    if (!user_id || !family_id || !role) {
      throw new Error('user_id, family_id, and role are required');
    }

    if (!['ADMIN_PARENT', 'CO_PARENT'].includes(role)) {
      throw new Error('role must be ADMIN_PARENT or CO_PARENT');
    }

    try {
      const result = await query(
        `INSERT INTO parents (user_id, family_id, role, invited_by_user_id, invited_at, joined_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [user_id, family_id, role, invited_by_user_id || null, invited_at || null, joined_at || null]
      );

      logger.info('Parent record created', {
        parent_id: result.rows[0].id,
        user_id,
        family_id,
        role,
      });

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'parents_user_id_family_id_key') {
        throw new Error('User is already a parent in this family');
      }
      logger.error('Failed to create parent', { error, user_id, family_id, role });
      throw error;
    }
  }

  /**
   * Find parent record
   * PARTITION KEY: family_id MUST be included in query
   */
  static async findByUserAndFamily(user_id: string, family_id: string): Promise<Parent | null> {
    try {
      const result = await query(
        'SELECT * FROM parents WHERE user_id = $1 AND family_id = $2',
        [user_id, family_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find parent', { error, user_id, family_id });
      throw error;
    }
  }

  /**
   * Find parent by ID and family_id
   * PARTITION KEY: family_id MUST be included
   */
  static async findById(parent_id: string, family_id: string): Promise<Parent | null> {
    try {
      const result = await query(
        'SELECT * FROM parents WHERE id = $1 AND family_id = $2',
        [parent_id, family_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find parent by ID', { error, parent_id, family_id });
      throw error;
    }
  }

  /**
   * Get all parents in a family
   * PARTITION KEY: family_id MUST be included
   */
  static async getAllByFamily(family_id: string): Promise<Parent[]> {
    try {
      const result = await query(
        'SELECT * FROM parents WHERE family_id = $1 ORDER BY created_at ASC',
        [family_id]
      );
      return result.rows;
    } catch (error) {
      logger.error('Failed to get parents by family', { error, family_id });
      throw error;
    }
  }

  /**
   * Get all admin parents in a family
   * PARTITION KEY: family_id MUST be included
   */
  static async getAdminsByFamily(family_id: string): Promise<Parent[]> {
    try {
      const result = await query(
        'SELECT * FROM parents WHERE family_id = $1 AND role = $2',
        [family_id, 'ADMIN_PARENT']
      );
      return result.rows;
    } catch (error) {
      logger.error('Failed to get admin parents', { error, family_id });
      throw error;
    }
  }

  /**
   * Update parent role
   * PARTITION KEY: family_id MUST be included
   */
  static async updateRole(parent_id: string, family_id: string, role: ParentRole): Promise<Parent> {
    if (!['ADMIN_PARENT', 'CO_PARENT'].includes(role)) {
      throw new Error('role must be ADMIN_PARENT or CO_PARENT');
    }

    try {
      const result = await query(
        'UPDATE parents SET role = $1 WHERE id = $2 AND family_id = $3 RETURNING *',
        [role, parent_id, family_id]
      );

      if (result.rows.length === 0) {
        throw new Error('Parent not found');
      }

      logger.info('Parent role updated', { parent_id, family_id, role });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update parent role', { error, parent_id, family_id });
      throw error;
    }
  }

  /**
   * Update joined_at timestamp (when invitation is accepted)
   * PARTITION KEY: family_id MUST be included
   */
  static async setJoinedAt(parent_id: string, family_id: string, joined_at: Date): Promise<Parent> {
    try {
      const result = await query(
        'UPDATE parents SET joined_at = $1 WHERE id = $2 AND family_id = $3 RETURNING *',
        [joined_at, parent_id, family_id]
      );

      if (result.rows.length === 0) {
        throw new Error('Parent not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to set joined_at', { error, parent_id, family_id });
      throw error;
    }
  }
}
