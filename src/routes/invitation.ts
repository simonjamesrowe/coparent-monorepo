/**
 * Invitation Routes - Phase 5, Tasks 5.3-5.6
 * POST /api/v1/invitations
 * GET /api/v1/invitations/{token}/preview
 * POST /api/v1/invitations/{token}/accept
 * POST /api/v1/invitations/{id}/resend
 */

import { Router, Request, Response } from 'express';
import { validateJWT, getUserContext } from '../middleware/jwt';
import { verifyFamilyAccess, verifyAdminAccess } from '../middleware/tenantIsolation';
import { invitationLimiter, previewLimiter, acceptLimiter, resendLimiter } from '../middleware/rateLimiter';
import { UserModel } from '../models/User';
import { FamilyModel } from '../models/Family';
import { ParentModel } from '../models/Parent';
import { ChildModel } from '../models/Child';
import { InvitationModel } from '../models/Invitation';
import { TokenGenerator } from '../services/TokenGenerator';
import { EmailService } from '../services/EmailService';
import { auth0ManagementAPI } from '../services/Auth0ManagementAPI';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/v1/invitations
 * Create and send parent invitation (Task 5.3)
 */
router.post('/', invitationLimiter, validateJWT, verifyFamilyAccess, verifyAdminAccess, async (req: Request, res: Response) => {
  try {
    const family_id = (req as any).family_id;
    const parent = (req as any).parent;
    const { email, message } = req.body;
    const userContext = getUserContext(req);

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({
        error: 'bad_request',
        message: 'email is required',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Self-invitation check
    if (trimmedEmail === userContext.email) {
      return res.status(409).json({
        error: 'conflict',
        message: 'Cannot invite yourself',
      });
    }

    // Duplicate invitation check
    const pending = await InvitationModel.pendingExists(family_id, trimmedEmail);
    if (pending) {
      return res.status(409).json({
        error: 'conflict',
        message: 'This email already has a pending invitation',
      });
    }

    // Check if email is already a parent
    const existingParent = await ParentModel.getAllByFamily(family_id);
    if (existingParent.some((p) => p.user_id === trimmedEmail)) {
      return res.status(409).json({
        error: 'conflict',
        message: 'This email is already a parent in this family',
      });
    }

    // Get family details
    const family = await FamilyModel.findById(family_id);
    if (!family) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Family not found',
      });
    }

    // Generate token and create invitation
    const token = TokenGenerator.generateInvitationToken();
    const expiresAt = TokenGenerator.generateExpirationDate(7);

    const invitation = await InvitationModel.create(
      family_id,
      parent.id,
      trimmedEmail,
      token,
      expiresAt
    );

    // Get family children
    const children = await ChildModel.getAllByFamily(family_id);

    // Get inviting parent user details
    const invitingUser = await UserModel.findById(parent.user_id);

    // Send invitation email
    try {
      const invitationUrl = `${process.env.FRONTEND_URL}/invite/${token}`;
      await EmailService.sendInvitationEmail(trimmedEmail, {
        family_name: family.name,
        children: children.map((c) => ({
          name: c.name,
          date_of_birth: typeof c.date_of_birth === 'string' ? c.date_of_birth : c.date_of_birth.toISOString().split('T')[0],
        })),
        inviting_parent_name: invitingUser?.name || 'A parent',
        invitation_message: message,
        invitation_url: invitationUrl,
        expires_at: expiresAt.toISOString().split('T')[0],
      });
    } catch (emailError) {
      logger.error('Failed to send invitation email', { emailError, email: trimmedEmail });
      // Delete invitation if email fails
      return res.status(500).json({
        error: 'email_send_failed',
        message: 'Failed to send invitation email',
      });
    }

    const invitationUrl = `${process.env.FRONTEND_URL}/invite/${token}`;

    res.status(201).json({
      invitation: {
        id: invitation.id,
        family_id: invitation.family_id,
        inviting_parent_id: invitation.inviting_parent_id,
        email: invitation.email,
        token: invitation.token,
        status: invitation.status,
        expires_at: invitation.expires_at,
        created_at: invitation.created_at,
      },
      invitation_url: invitationUrl,
    });
  } catch (error: any) {
    logger.error('Invitation creation failed', { error: error.message });
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to create invitation',
    });
  }
});

/**
 * GET /api/v1/invitations/{token}/preview
 * Preview invitation without authentication (Task 5.4)
 */
router.get('/:token/preview', previewLimiter, async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Find invitation by token
    const invitation = await InvitationModel.findByToken(token);

    if (!invitation) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Invitation not found',
      });
    }

    // Check expiration and status
    if (invitation.status !== 'PENDING') {
      return res.status(410).json({
        error: 'gone',
        message: `Invitation has been ${invitation.status.toLowerCase()}`,
      });
    }

    if (TokenGenerator.isTokenExpired(new Date(invitation.expires_at))) {
      return res.status(410).json({
        error: 'gone',
        message: 'Invitation link has expired',
      });
    }

    // Get family and children
    const family = await FamilyModel.findById(invitation.family_id);
    const children = await ChildModel.getAllByFamily(invitation.family_id);

    // Get inviting parent user
    const parentRecord = await ParentModel.findById(invitation.inviting_parent_id, invitation.family_id);
    const invitingUser = parentRecord ? await UserModel.findById(parentRecord.user_id) : null;

    if (!family) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Family not found',
      });
    }

    res.json({
      invitation: {
        id: invitation.id,
        family_id: invitation.family_id,
        email: invitation.email,
        status: invitation.status,
        expires_at: invitation.expires_at,
        created_at: invitation.created_at,
      },
      family: {
        id: family.id,
        name: family.name,
        created_at: family.created_at,
      },
      children: children.map((child) => ({
        id: child.id,
        name: child.name,
        date_of_birth: typeof child.date_of_birth === 'string' ? child.date_of_birth : child.date_of_birth.toISOString().split('T')[0],
      })),
      inviting_parent: invitingUser ? {
        id: parentRecord!.id,
        name: invitingUser.name,
        avatar_url: invitingUser.avatar_url,
      } : null,
    });
  } catch (error: any) {
    logger.error('Invitation preview failed', { error: error.message });
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to fetch invitation preview',
    });
  }
});

/**
 * POST /api/v1/invitations/{token}/accept
 * Accept invitation and join family (Task 5.5)
 */
router.post('/:token/accept', acceptLimiter, validateJWT, async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const userContext = getUserContext(req);

    // Get user from database
    const user = await UserModel.findByAuth0Id(userContext.auth0_id);
    if (!user) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'User not found',
      });
    }

    // Find invitation
    const invitation = await InvitationModel.findByToken(token);

    if (!invitation) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Invitation not found',
      });
    }

    // Validate invitation
    if (invitation.status !== 'PENDING') {
      return res.status(410).json({
        error: 'gone',
        message: `Invitation has been ${invitation.status.toLowerCase()}`,
      });
    }

    if (TokenGenerator.isTokenExpired(new Date(invitation.expires_at))) {
      return res.status(410).json({
        error: 'gone',
        message: 'Invitation has expired',
      });
    }

    // Check email matches
    if (user.email !== invitation.email) {
      return res.status(409).json({
        error: 'conflict',
        message: 'Email address does not match invitation',
      });
    }

    // Check user not already parent
    const existingParent = await ParentModel.findByUserAndFamily(user.id, invitation.family_id);
    if (existingParent) {
      return res.status(409).json({
        error: 'conflict',
        message: 'User is already a parent in this family',
      });
    }

    // Create parent record
    const parent = await ParentModel.create(
      user.id,
      invitation.family_id,
      'CO_PARENT',
      undefined,
      undefined,
      new Date()
    );

    // Update invitation
    await InvitationModel.updateStatus(invitation.id, invitation.family_id, 'ACCEPTED', user.id);

    // Sync role to Auth0
    try {
      await auth0ManagementAPI.addRoleToUser(user.auth0_id, 'CO_PARENT');
    } catch (error) {
      logger.error('Failed to sync role to Auth0', { error, auth0_id: user.auth0_id });
    }

    const family = await FamilyModel.findById(invitation.family_id);

    logger.info('Invitation accepted', {
      invitation_id: invitation.id,
      user_id: user.id,
      family_id: invitation.family_id,
    });

    res.json({
      invitation: {
        id: invitation.id,
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: user.id,
      },
      family: {
        id: family?.id,
        name: family?.name,
        created_at: family?.created_at,
      },
      parent: {
        id: parent.id,
        user_id: parent.user_id,
        family_id: parent.family_id,
        role: parent.role,
        joined_at: parent.joined_at,
      },
    });
  } catch (error: any) {
    logger.error('Invitation acceptance failed', { error: error.message });
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to accept invitation',
    });
  }
});

/**
 * POST /api/v1/invitations/{id}/resend
 * Resend expired invitation with new token (Task 5.6)
 */
router.post('/:invitation_id/resend', resendLimiter, validateJWT, verifyFamilyAccess, verifyAdminAccess, async (req: Request, res: Response) => {
  try {
    const { invitation_id } = req.params;
    const family_id = (req as any).family_id;

    // Find old invitation
    const oldInvitation = await InvitationModel.findById(invitation_id, family_id);

    if (!oldInvitation) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Invitation not found',
      });
    }

    if (oldInvitation.status === 'ACCEPTED') {
      return res.status(400).json({
        error: 'bad_request',
        message: 'Cannot resend an accepted invitation',
      });
    }

    // Generate new token and invitation
    const newToken = TokenGenerator.generateInvitationToken();
    const expiresAt = TokenGenerator.generateExpirationDate(7);

    const newInvitation = await InvitationModel.create(
      family_id,
      oldInvitation.inviting_parent_id,
      oldInvitation.email,
      newToken,
      expiresAt
    );

    // Revoke old invitation
    await InvitationModel.revoke(invitation_id);

    // Get family and details
    const family = await FamilyModel.findById(family_id);
    const children = await ChildModel.getAllByFamily(family_id);
    const invitingParent = await ParentModel.findById(oldInvitation.inviting_parent_id, family_id);
    const invitingUser = invitingParent ? await UserModel.findById(invitingParent.user_id) : null;

    // Send new email
    try {
      const invitationUrl = `${process.env.FRONTEND_URL}/invite/${newToken}`;
      await EmailService.sendInvitationEmail(oldInvitation.email, {
        family_name: family?.name || '',
        children: children.map((c) => ({
          name: c.name,
          date_of_birth: typeof c.date_of_birth === 'string' ? c.date_of_birth : c.date_of_birth.toISOString().split('T')[0],
        })),
        inviting_parent_name: invitingUser?.name || 'A parent',
        invitation_url: invitationUrl,
        expires_at: expiresAt.toISOString().split('T')[0],
      });
    } catch (emailError) {
      logger.error('Failed to send resend email', { emailError });
      return res.status(500).json({
        error: 'email_send_failed',
        message: 'Failed to send invitation email',
      });
    }

    logger.info('Invitation resent', {
      old_invitation_id: invitation_id,
      new_invitation_id: newInvitation.id,
      email: oldInvitation.email,
    });

    const invitationUrl = `${process.env.FRONTEND_URL}/invite/${newToken}`;

    res.json({
      old_invitation: {
        id: oldInvitation.id,
        status: 'REVOKED',
      },
      new_invitation: {
        id: newInvitation.id,
        email: newInvitation.email,
        token: newInvitation.token,
        status: newInvitation.status,
        expires_at: newInvitation.expires_at,
        created_at: newInvitation.created_at,
      },
      invitation_url: invitationUrl,
    });
  } catch (error: any) {
    logger.error('Invitation resend failed', { error: error.message });
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to resend invitation',
    });
  }
});

export default router;
