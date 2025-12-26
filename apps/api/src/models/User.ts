/**
 * User Model - Task 3.1
 * Represents internal user records linked to Auth0
 * Includes validations and soft delete support
 */

import { query } from '../db/connection';
import { User } from '../types';
import logger from '../utils/logger';

export class UserModel {
  /**
   * Create a new user record
   */
  static async create(
    auth0_id: string,
    email: string,
    name: string,
    phone?: string,
    avatar_url?: string
  ): Promise<User> {
    // Validation
    if (!auth0_id || !email || !name) {
      throw new Error('auth0_id, email, and name are required');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    try {
      const result = await query(
        `INSERT INTO users (auth0_id, email, name, phone, avatar_url, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING *`,
        [auth0_id, email, name, phone || null, avatar_url || null]
      );

      logger.info('User created', {
        user_id: result.rows[0].id,
        auth0_id,
        email,
      });

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.constraint === 'users_auth0_id_key') {
          throw new Error('User with this auth0_id already exists');
        }
        if (error.constraint === 'users_email_key') {
          throw new Error('User with this email already exists');
        }
      }
      logger.error('Failed to create user', { error, auth0_id, email });
      throw error;
    }
  }

  /**
   * Find user by auth0_id (active users only)
   */
  static async findByAuth0Id(auth0_id: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM users WHERE auth0_id = $1 AND is_active = true',
        [auth0_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find user by auth0_id', { error, auth0_id });
      throw error;
    }
  }

  /**
   * Find user by email (active users only)
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find user by email', { error, email });
      throw error;
    }
  }

  /**
   * Find user by ID (active users only)
   */
  static async findById(id: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM users WHERE id = $1 AND is_active = true',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find user by ID', { error, user_id: id });
      throw error;
    }
  }

  /**
   * Update user record
   */
  static async update(id: string, updates: Partial<User>): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.email) {
      if (!this.isValidEmail(updates.email)) {
        throw new Error('Invalid email format');
      }
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }

    if (updates.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.phone) {
      fields.push(`phone = $${paramCount++}`);
      values.push(updates.phone);
    }

    if (updates.avatar_url) {
      fields.push(`avatar_url = $${paramCount++}`);
      values.push(updates.avatar_url);
    }

    if (fields.length === 0) {
      return this.findById(id) as Promise<User>;
    }

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} AND is_active = true RETURNING *`;

    try {
      const result = await query(sql, values);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      logger.info('User updated', { user_id: id });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update user', { error, user_id: id });
      throw error;
    }
  }

  /**
   * Soft delete user (mark inactive)
   * Data retained for audit and legal purposes
   */
  static async softDelete(id: string): Promise<void> {
    try {
      await query(
        `UPDATE users SET is_active = false, deleted_at = NOW() WHERE id = $1`,
        [id]
      );
      logger.info('User soft deleted', { user_id: id });
    } catch (error) {
      logger.error('Failed to soft delete user', { error, user_id: id });
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
