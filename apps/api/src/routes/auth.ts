/**
 * Authentication Routes - Phase 3, Tasks 3.2 & 3.3
 * POST /api/v1/users/register
 * GET /api/v1/users/me
 */

import { Router, Request, Response } from 'express';
import { validateJWT, getUserContext } from '../middleware/jwt';
import { registerLimiter } from '../middleware/rateLimiter';
import { UserModel } from '../models/User';
import { FamilyModel } from '../models/Family';
import { ParentModel } from '../models/Parent';
import logger from '../utils/logger';

const router: Router = Router();

/**
 * POST /api/v1/users/register
 * Register or verify user after Auth0 authentication (Task 3.2)
 * Called after signup/login to sync user to internal database
 */
router.post('/register', registerLimiter, validateJWT, async (req: Request, res: Response) => {
  try {
    const userContext = getUserContext(req);
    const { auth0_id, email, name, avatar_url } = req.body;

    // Validation
    if (!auth0_id || !email || !name) {
      return res.status(400).json({
        error: 'bad_request',
        message: 'auth0_id, email, and name are required',
      });
    }

    // Verify JWT auth0_id matches request
    if (auth0_id !== userContext.auth0_id) {
      return res.status(400).json({
        error: 'bad_request',
        message: 'auth0_id in JWT does not match request body',
      });
    }

    // Check if user exists
    let user = await UserModel.findByAuth0Id(auth0_id);

    if (!user) {
      // Create new user
      user = await UserModel.create(auth0_id, email, name, undefined, avatar_url);
      logger.info('New user registered', { user_id: user.id, auth0_id, email });
    } else {
      // Update existing user if needed
      if (user.email !== email || user.name !== name) {
        user = await UserModel.update(user.id, { email, name, avatar_url });
      }
    }

    // Check if user has a family
    const family = await FamilyModel.findByUserId(user.id);

    res.status(user ? 200 : 201).json({
      user: {
        id: user.id,
        auth0_id: user.auth0_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      family: family ? {
        id: family.id,
        name: family.name,
        created_at: family.created_at,
      } : null,
      needs_family_setup: !family,
      role: family ? (await ParentModel.findByUserAndFamily(user.id, family.id))?.role : null,
    });
  } catch (error: any) {
    logger.error('User registration failed', { error: error.message });

    if (error.message?.includes('already exists')) {
      return res.status(409).json({
        error: 'conflict',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to register user',
    });
  }
});

/**
 * GET /api/v1/users/me
 * Fetch current authenticated user and family context (Task 3.3)
 * Called on app load to restore user and family context
 */
router.get('/me', validateJWT, async (req: Request, res: Response) => {
  try {
    const userContext = getUserContext(req);

    // Get user from database
    const user = await UserModel.findByAuth0Id(userContext.auth0_id);

    if (!user) {
      return res.status(404).json({
        error: 'not_found',
        message: 'User not found',
      });
    }

    // Get family and parent role
    const family = await FamilyModel.findByUserId(user.id);
    let role = null;
    let joined_at = null;

    if (family) {
      const parent = await ParentModel.findByUserAndFamily(user.id, family.id);
      if (parent) {
        role = parent.role;
        joined_at = parent.joined_at;
      }
    }

    res.json({
      user: {
        id: user.id,
        auth0_id: user.auth0_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        created_at: user.created_at,
      },
      family: family ? {
        id: family.id,
        name: family.name,
        created_by_user_id: family.created_by_user_id,
        created_at: family.created_at,
      } : null,
      role,
      joined_at,
    });
  } catch (error: any) {
    logger.error('Failed to fetch user context', { error: error.message });

    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to fetch user context',
    });
  }
});

export default router;
