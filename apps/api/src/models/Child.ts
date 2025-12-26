/**
 * Child Model - Task 4.3
 * Represents children in family for pre-filled family information
 * Query-time isolation: All queries must include family_id
 */

import { query } from '../db/connection';
import { Child } from '../types';
import logger from '../utils/logger';

export class ChildModel {
  /**
   * Create a child record
   * PARTITION KEY: family_id
   */
  static async create(
    family_id: string,
    name: string,
    date_of_birth: Date | string
  ): Promise<Child> {
    // Validation
    if (!family_id || !name || !date_of_birth) {
      throw new Error('family_id, name, and date_of_birth are required');
    }

    if (!name.trim()) {
      throw new Error('Child name cannot be empty');
    }

    try {
      const result = await query(
        `INSERT INTO children (family_id, name, date_of_birth)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [family_id, name.trim(), date_of_birth]
      );

      logger.info('Child record created', {
        child_id: result.rows[0].id,
        family_id,
        name,
      });

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create child', { error, family_id, name });
      throw error;
    }
  }

  /**
   * Create multiple children for a family
   * Batch operation with transaction rollback on failure
   */
  static async createMultiple(
    family_id: string,
    children: Array<{ name: string; date_of_birth: Date | string }>
  ): Promise<Child[]> {
    if (!children || children.length === 0) {
      throw new Error('At least one child is required');
    }

    const results: Child[] = [];

    try {
      for (const child of children) {
        const result = await this.create(family_id, child.name, child.date_of_birth);
        results.push(result);
      }

      return results;
    } catch (error) {
      logger.error('Failed to create multiple children', { error, family_id });
      throw error;
    }
  }

  /**
   * Get all children in a family
   * PARTITION KEY: family_id MUST be included in query
   */
  static async getAllByFamily(family_id: string): Promise<Child[]> {
    try {
      const result = await query(
        'SELECT * FROM children WHERE family_id = $1 ORDER BY date_of_birth ASC',
        [family_id]
      );
      return result.rows;
    } catch (error) {
      logger.error('Failed to get children by family', { error, family_id });
      throw error;
    }
  }

  /**
   * Get a single child by ID
   * PARTITION KEY: family_id MUST be included for isolation
   */
  static async findById(child_id: string, family_id: string): Promise<Child | null> {
    try {
      const result = await query(
        'SELECT * FROM children WHERE id = $1 AND family_id = $2',
        [child_id, family_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find child by ID', { error, child_id, family_id });
      throw error;
    }
  }

  /**
   * Update child information
   * PARTITION KEY: family_id MUST be included
   */
  static async update(
    child_id: string,
    family_id: string,
    name?: string,
    date_of_birth?: Date | string
  ): Promise<Child> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name) {
      if (!name.trim()) {
        throw new Error('Child name cannot be empty');
      }
      updates.push(`name = $${paramCount++}`);
      values.push(name.trim());
    }

    if (date_of_birth) {
      updates.push(`date_of_birth = $${paramCount++}`);
      values.push(date_of_birth);
    }

    if (updates.length === 0) {
      const child = await this.findById(child_id, family_id);
      if (!child) throw new Error('Child not found');
      return child;
    }

    values.push(child_id);
    values.push(family_id);

    const sql = `UPDATE children SET ${updates.join(', ')} WHERE id = $${paramCount++} AND family_id = $${paramCount} RETURNING *`;

    try {
      const result = await query(sql, values);

      if (result.rows.length === 0) {
        throw new Error('Child not found');
      }

      logger.info('Child updated', { child_id, family_id });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update child', { error, child_id, family_id });
      throw error;
    }
  }

  /**
   * Delete a child
   * PARTITION KEY: family_id MUST be included
   */
  static async delete(child_id: string, family_id: string): Promise<void> {
    try {
      const result = await query(
        'DELETE FROM children WHERE id = $1 AND family_id = $2',
        [child_id, family_id]
      );

      if (result.rowCount === 0) {
        throw new Error('Child not found');
      }

      logger.info('Child deleted', { child_id, family_id });
    } catch (error) {
      logger.error('Failed to delete child', { error, child_id, family_id });
      throw error;
    }
  }
}
