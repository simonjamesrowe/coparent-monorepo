/**
 * Family Model - Task 4.1
 * Represents a family unit (tenant boundary)
 * Includes validations and tenant isolation
 */

import { query } from '../db/connection';
import { Family } from '../types';
import logger from '../utils/logger';

export class FamilyModel {
  /**
   * Create a new family unit
   * Only one family per parent in MVP
   */
  static async create(
    name: string,
    created_by_user_id: string
  ): Promise<Family> {
    // Validation
    if (!name || !name.trim()) {
      throw new Error('Family name is required');
    }

    if (!created_by_user_id) {
      throw new Error('created_by_user_id is required');
    }

    try {
      const result = await query(
        `INSERT INTO families (name, created_by_user_id)
         VALUES ($1, $2)
         RETURNING *`,
        [name.trim(), created_by_user_id]
      );

      logger.info('Family created', {
        family_id: result.rows[0].id,
        created_by_user_id,
        name,
      });

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create family', { error, created_by_user_id, name });
      throw error;
    }
  }

  /**
   * Find family by ID
   * Includes partition key (family_id) in query
   */
  static async findById(family_id: string): Promise<Family | null> {
    try {
      const result = await query(
        'SELECT * FROM families WHERE id = $1',
        [family_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find family by ID', { error, family_id });
      throw error;
    }
  }

  /**
   * Find family for a user
   * MVP: One family per user (1:1 relationship)
   */
  static async findByUserId(user_id: string): Promise<Family | null> {
    try {
      const result = await query(
        `SELECT f.* FROM families f
         INNER JOIN parents p ON f.id = p.family_id
         WHERE p.user_id = $1
         LIMIT 1`,
        [user_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find family by user ID', { error, user_id });
      throw error;
    }
  }

  /**
   * Check if user already has a family
   * MVP constraint: 1:1 relationship
   */
  static async userHasFamily(user_id: string): Promise<boolean> {
    try {
      const result = await query(
        `SELECT COUNT(*) FROM parents WHERE user_id = $1`,
        [user_id]
      );
      return parseInt(result.rows[0].count, 10) > 0;
    } catch (error) {
      logger.error('Failed to check user family', { error, user_id });
      throw error;
    }
  }

  /**
   * Update family (name only)
   */
  static async update(family_id: string, name: string): Promise<Family> {
    if (!name || !name.trim()) {
      throw new Error('Family name is required');
    }

    try {
      const result = await query(
        'UPDATE families SET name = $1 WHERE id = $2 RETURNING *',
        [name.trim(), family_id]
      );

      if (result.rows.length === 0) {
        throw new Error('Family not found');
      }

      logger.info('Family updated', { family_id, name });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update family', { error, family_id });
      throw error;
    }
  }
}
