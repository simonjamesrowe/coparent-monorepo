/**
 * Tenant Isolation Middleware - Phase 10, Task 10.2
 * Verifies user belongs to requested family before processing
 * Secondary isolation strategy (primary is query-level filtering)
 */

import { Request, Response, NextFunction } from 'express';
import { ParentModel } from '../models/Parent';
import { UserContext } from '../types';
import logger from '../utils/logger';

/**
 * Middleware to verify family access
 * Extracts family_id from route params or request body
 * Ensures user is a parent in the family
 */
export async function verifyFamilyAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = (req as any).user as UserContext;
    if (!userContext) {
      res.status(401).json({ error: 'unauthorized', message: 'No user context' });
      return;
    }

    // Extract family_id from params or body
    const family_id = req.params.family_id || req.body?.family_id;

    if (!family_id) {
      res.status(400).json({
        error: 'bad_request',
        message: 'family_id is required',
      });
      return;
    }

    // Import User model here to avoid circular dependency
    const { UserModel } = require('../models/User');

    // Get user from database
    const user = await UserModel.findByAuth0Id(userContext.auth0_id);
    if (!user) {
      res.status(401).json({
        error: 'unauthorized',
        message: 'User not found',
      });
      return;
    }

    // Verify parent belongs to this family
    const parent = await ParentModel.findByUserAndFamily(user.id, family_id);

    if (!parent) {
      // Log cross-family access attempt
      logger.warn('Cross-family access attempt', {
        event: 'cross_family_access_attempt',
        auth0_id: userContext.auth0_id,
        attempted_family_id: family_id,
        endpoint: req.path,
        method: req.method,
        ip: req.ip,
      });

      res.status(403).json({
        error: 'forbidden',
        message: 'You do not have access to this family',
      });
      return;
    }

    // Attach family context to request
    (req as any).family_id = family_id;
    (req as any).user_id = user.id;
    (req as any).parent = parent;

    logger.info('Family access verified', {
      user_id: user.id,
      family_id,
    });

    next();
  } catch (error) {
    logger.error('Family access verification failed', { error });
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to verify family access',
    });
  }
}

/**
 * Middleware to verify admin access
 * Ensures user is ADMIN_PARENT in the family
 * Must be used after verifyFamilyAccess
 */
export async function verifyAdminAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parent = (req as any).parent;

    if (!parent) {
      res.status(500).json({
        error: 'internal_server_error',
        message: 'Parent context not found',
      });
      return;
    }

    if (parent.role !== 'ADMIN_PARENT') {
      logger.warn('Non-admin access attempt', {
        event: 'unauthorized_access',
        user_id: (req as any).user_id,
        family_id: (req as any).family_id,
        endpoint: req.path,
        required_role: 'ADMIN_PARENT',
        actual_role: parent.role,
      });

      res.status(403).json({
        error: 'forbidden',
        message: 'Only admin parents can perform this action',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Admin access verification failed', { error });
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to verify admin access',
    });
  }
}

/**
 * Middleware to ensure is_active user
 * Prevents soft-deleted users from accessing resources
 */
export async function ensureActiveUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = (req as any).user as UserContext;
    const { UserModel } = require('../models/User');

    const user = await UserModel.findByAuth0Id(userContext.auth0_id);

    if (!user || !user.is_active) {
      logger.warn('Inactive user access attempt', {
        auth0_id: userContext.auth0_id,
      });

      res.status(401).json({
        error: 'unauthorized',
        message: 'User account is inactive',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('User status verification failed', { error });
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to verify user status',
    });
  }
}
