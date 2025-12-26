/**
 * Expense Model
 * Family expenses with financial privacy controls
 * Query-time isolation: All queries MUST include family_id partition key
 */

import { query } from '../db/connection';
import { Expense, ExpensePrivacyMode } from '../types';
import logger from '../utils/logger';

export class ExpenseModel {
  /**
   * Create an expense record
   * PARTITION KEY: family_id MUST be included
   */
  static async create(
    family_id: string,
    created_by_user_id: string,
    amount: number,
    category: string,
    date: Date | string,
    privacy_mode: ExpensePrivacyMode = 'FULL_SHARED',
    description?: string,
    receipt_url?: string
  ): Promise<Expense> {
    // Validation
    if (!family_id || !created_by_user_id || !amount || !category) {
      throw new Error('family_id, created_by_user_id, amount, and category are required');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!['PRIVATE', 'AMOUNT_ONLY', 'FULL_SHARED'].includes(privacy_mode)) {
      throw new Error('Invalid privacy_mode');
    }

    try {
      const result = await query(
        `INSERT INTO expenses (family_id, created_by_user_id, amount, category, date, description, receipt_url, privacy_mode)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [family_id, created_by_user_id, amount, category, date, description || null, receipt_url || null, privacy_mode]
      );

      logger.info('Expense created', {
        expense_id: result.rows[0].id,
        family_id,
        amount,
        category,
      });

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create expense', { error, family_id, category });
      throw error;
    }
  }

  /**
   * Get expense by ID with privacy checks
   * PARTITION KEY: family_id MUST be included
   * Apply privacy_mode filtering
   */
  static async findById(
    expense_id: string,
    family_id: string,
    requesting_user_id?: string
  ): Promise<Expense | null> {
    try {
      const result = await query(
        'SELECT * FROM expenses WHERE id = $1 AND family_id = $2',
        [expense_id, family_id]
      );

      const expense = result.rows[0] || null;
      if (!expense) return null;

      // Apply privacy filtering
      return this.applyPrivacyFilter(expense, requesting_user_id);
    } catch (error) {
      logger.error('Failed to find expense by ID', { error, expense_id, family_id });
      throw error;
    }
  }

  /**
   * Get all expenses for a family
   * PARTITION KEY: family_id MUST be included
   * Apply privacy filtering based on requesting user
   */
  static async getByFamily(
    family_id: string,
    requesting_user_id?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<Expense[]> {
    try {
      const result = await query(
        'SELECT * FROM expenses WHERE family_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3',
        [family_id, limit, offset]
      );

      // Apply privacy filtering to each expense
      return result.rows
        .map((expense) => this.applyPrivacyFilter(expense, requesting_user_id))
        .filter((expense) => expense !== null);
    } catch (error) {
      logger.error('Failed to get expenses by family', { error, family_id });
      throw error;
    }
  }

  /**
   * Get expenses created by a specific user in a family
   * PARTITION KEY: family_id MUST be included
   */
  static async getByCreator(
    family_id: string,
    created_by_user_id: string
  ): Promise<Expense[]> {
    try {
      const result = await query(
        'SELECT * FROM expenses WHERE family_id = $1 AND created_by_user_id = $2 ORDER BY date DESC',
        [family_id, created_by_user_id]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get expenses by creator', { error, family_id });
      throw error;
    }
  }

  /**
   * Update expense
   * PARTITION KEY: family_id MUST be included
   */
  static async update(
    expense_id: string,
    family_id: string,
    updates: Partial<Expense>
  ): Promise<Expense> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.amount !== undefined) {
      if (updates.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      fields.push(`amount = $${paramCount++}`);
      values.push(updates.amount);
    }

    if (updates.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(updates.category);
    }

    if (updates.date !== undefined) {
      fields.push(`date = $${paramCount++}`);
      values.push(updates.date);
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (updates.receipt_url !== undefined) {
      fields.push(`receipt_url = $${paramCount++}`);
      values.push(updates.receipt_url);
    }

    if (updates.privacy_mode !== undefined) {
      if (!['PRIVATE', 'AMOUNT_ONLY', 'FULL_SHARED'].includes(updates.privacy_mode)) {
        throw new Error('Invalid privacy_mode');
      }
      fields.push(`privacy_mode = $${paramCount++}`);
      values.push(updates.privacy_mode);
    }

    if (fields.length === 0) {
      const expense = await this.findById(expense_id, family_id);
      if (!expense) throw new Error('Expense not found');
      return expense;
    }

    values.push(expense_id);
    values.push(family_id);

    const sql = `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${paramCount++} AND family_id = $${paramCount} RETURNING *`;

    try {
      const result = await query(sql, values);

      if (result.rows.length === 0) {
        throw new Error('Expense not found');
      }

      logger.info('Expense updated', { expense_id, family_id });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update expense', { error, expense_id, family_id });
      throw error;
    }
  }

  /**
   * Delete expense
   * PARTITION KEY: family_id MUST be included
   */
  static async delete(expense_id: string, family_id: string): Promise<void> {
    try {
      const result = await query(
        'DELETE FROM expenses WHERE id = $1 AND family_id = $2',
        [expense_id, family_id]
      );

      if (result.rowCount === 0) {
        throw new Error('Expense not found');
      }

      logger.info('Expense deleted', { expense_id, family_id });
    } catch (error) {
      logger.error('Failed to delete expense', { error, expense_id, family_id });
      throw error;
    }
  }

  /**
   * Apply privacy_mode filtering
   * PRIVATE: Hide from non-creator
   * AMOUNT_ONLY: Show amount only to non-creator
   * FULL_SHARED: Show all to co-parent
   */
  private static applyPrivacyFilter(
    expense: Expense,
    requesting_user_id?: string
  ): Expense | null {
    // Creator always sees full expense
    if (requesting_user_id === expense.created_by_user_id) {
      return expense;
    }

    // If requesting user not provided, return null (unauthenticated)
    if (!requesting_user_id) {
      return null;
    }

    // Apply privacy mode rules
    switch (expense.privacy_mode) {
      case 'PRIVATE':
        // Non-creator cannot see private expenses
        return null;

      case 'AMOUNT_ONLY':
        // Show only amount to co-parent
        return {
          ...expense,
          description: null,
          receipt_url: null,
          category: '',
        } as Expense;

      case 'FULL_SHARED':
        // Co-parent sees full expense
        return expense;

      default:
        return expense;
    }
  }
}
