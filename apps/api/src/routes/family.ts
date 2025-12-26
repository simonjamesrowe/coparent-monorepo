/**
 * Family Management Routes - Phase 4, Task 4.4
 * POST /api/v1/families
 * PUT /api/v1/families/{id}/transfer-admin
 */

import { Router, Request, Response } from 'express';
import { validateJWT, getUserContext } from '../middleware/jwt';
import { verifyFamilyAccess, verifyAdminAccess } from '../middleware/tenantIsolation';
import { familyLimiter, transferAdminLimiter } from '../middleware/rateLimiter';
import { UserModel } from '../models/User';
import { FamilyModel } from '../models/Family';
import { ParentModel } from '../models/Parent';
import { ChildModel } from '../models/Child';
import { auth0ManagementAPI } from '../services/Auth0ManagementAPI';
import logger from '../utils/logger';

const router: Router = Router();

/**
 * POST /api/v1/families
 * Create a new family unit (Task 4.4)
 * Requires: JWT, user without existing family
 */
router.post('/', familyLimiter, validateJWT, async (req: Request, res: Response) => {
  try {
    const userContext = getUserContext(req);
    const { name, children } = req.body;

    // Get user from database
    const user = await UserModel.findByAuth0Id(userContext.auth0_id);
    if (!user) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'User not found',
      });
    }

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'bad_request',
        message: 'Family name is required',
      });
    }

    if (!Array.isArray(children) || children.length === 0) {
      return res.status(400).json({
        error: 'bad_request',
        message: 'At least one child is required',
      });
    }

    // Validate children data
    for (const child of children) {
      if (!child.name || !child.date_of_birth) {
        return res.status(400).json({
          error: 'bad_request',
          message: 'Each child must have name and date_of_birth',
        });
      }
    }

    // Check if user already has a family (MVP constraint: 1:1)
    const hasFamily = await FamilyModel.userHasFamily(user.id);
    if (hasFamily) {
      return res.status(409).json({
        error: 'conflict',
        message: 'User already has a family',
      });
    }

    // Create family
    const family = await FamilyModel.create(name, user.id);

    // Create children
    const createdChildren = await ChildModel.createMultiple(
      family.id,
      children.map((c: any) => ({
        name: c.name,
        date_of_birth: c.date_of_birth,
      }))
    );

    // Create parent record with ADMIN_PARENT role
    const parent = await ParentModel.create(
      user.id,
      family.id,
      'ADMIN_PARENT',
      undefined,
      undefined,
      new Date()
    );

    // Sync ADMIN_PARENT role to Auth0
    try {
      await auth0ManagementAPI.addRoleToUser(user.auth0_id, 'ADMIN_PARENT');
    } catch (error) {
      logger.error('Failed to sync admin role to Auth0', { error, auth0_id: user.auth0_id });
      // Continue anyway - local role is source of truth
    }

    logger.info('Family created', {
      family_id: family.id,
      user_id: user.id,
      children_count: createdChildren.length,
    });

    res.status(201).json({
      family: {
        id: family.id,
        name: family.name,
        created_by_user_id: family.created_by_user_id,
        created_at: family.created_at,
        updated_at: family.updated_at,
      },
      children: createdChildren.map((child) => ({
        id: child.id,
        family_id: child.family_id,
        name: child.name,
        date_of_birth: child.date_of_birth,
        created_at: child.created_at,
      })),
      parent: {
        id: parent.id,
        user_id: parent.user_id,
        family_id: parent.family_id,
        role: parent.role,
        joined_at: parent.joined_at,
        created_at: parent.created_at,
      },
    });
  } catch (error: any) {
    logger.error('Family creation failed', { error: error.message });

    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to create family',
    });
  }
});

/**
 * PUT /api/v1/families/{id}/transfer-admin
 * Transfer admin privileges to a co-parent (Phase 6, Task 6.1)
 */
router.put(
  '/:family_id/transfer-admin',
  transferAdminLimiter,
  validateJWT,
  verifyFamilyAccess,
  verifyAdminAccess,
  async (req: Request, res: Response) => {
    try {
      const family_id = req.params.family_id;
      const { target_user_id } = req.body;
      const currentParent = (req as any).parent;
      const user = await UserModel.findById((req as any).user_id);

      if (!user) {
        return res.status(401).json({
          error: 'unauthorized',
          message: 'User not found',
        });
      }

      // Validation
      if (!target_user_id) {
        return res.status(400).json({
          error: 'bad_request',
          message: 'target_user_id is required',
        });
      }

      if (target_user_id === user.id) {
        return res.status(400).json({
          error: 'bad_request',
          message: 'Cannot transfer admin to yourself',
        });
      }

      // Get target parent
      const targetParent = await ParentModel.findByUserAndFamily(target_user_id, family_id);

      if (!targetParent) {
        return res.status(404).json({
          error: 'not_found',
          message: 'Target user not found in family',
        });
      }

      if (targetParent.role !== 'CO_PARENT') {
        return res.status(409).json({
          error: 'conflict',
          message: 'Target user must be a CO_PARENT',
        });
      }

      // Get target user for Auth0 sync
      const targetUser = await UserModel.findById(target_user_id);
      if (!targetUser) {
        return res.status(404).json({
          error: 'not_found',
          message: 'Target user not found',
        });
      }

      // Update roles in database
      const updatedCurrent = await ParentModel.updateRole(currentParent.id, family_id, 'CO_PARENT');
      const updatedTarget = await ParentModel.updateRole(targetParent.id, family_id, 'ADMIN_PARENT');

      // Sync roles to Auth0
      try {
        await auth0ManagementAPI.syncRoles(user.auth0_id, ['CO_PARENT']);
        await auth0ManagementAPI.syncRoles(targetUser.auth0_id, ['ADMIN_PARENT']);
      } catch (error) {
        logger.error('Failed to sync roles to Auth0', { error });
        // Continue - local roles are source of truth
      }

      logger.info('Admin privileges transferred', {
        family_id,
        previous_admin: user.id,
        new_admin: target_user_id,
      });

      res.json({
        family: {
          id: family_id,
          name: (await FamilyModel.findById(family_id))?.name,
        },
        previous_admin: {
          id: updatedCurrent.id,
          user_id: updatedCurrent.user_id,
          role: updatedCurrent.role,
        },
        new_admin: {
          id: updatedTarget.id,
          user_id: updatedTarget.user_id,
          role: updatedTarget.role,
        },
        transfer_timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Admin transfer failed', { error: error.message });

      res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to transfer admin privileges',
      });
    }
  }
);

export default router;
