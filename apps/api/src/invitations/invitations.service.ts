import { randomUUID } from 'node:crypto';

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Invitation, InvitationDocument } from '../schemas/invitation.schema';
import { Family, FamilyDocument } from '../schemas/family.schema';
import { Parent, ParentDocument, ParentRole } from '../schemas/parent.schema';
import { EmailService } from '../email/email.service';
import { AuthUser } from '../families/families.service';

import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(Invitation.name)
    private invitationModel: Model<InvitationDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
    private emailService: EmailService,
  ) {}

  private async verifyFamilyAccess(
    familyId: string,
    user: AuthUser,
  ): Promise<{ family: FamilyDocument; parent: ParentDocument }> {
    const family = await this.familyModel.findOne({
      _id: new Types.ObjectId(familyId),
      deletedAt: null,
    });

    if (!family) {
      throw new NotFoundException(`Family with ID ${familyId} not found`);
    }

    const parent = await this.parentModel.findOne({
      auth0Id: user.auth0Id,
      familyId: family._id,
    });

    if (!parent) {
      throw new ForbiddenException('You do not have access to this family');
    }

    return { family, parent };
  }

  async create(
    familyId: string,
    createInvitationDto: CreateInvitationDto,
    user: AuthUser,
  ): Promise<InvitationDocument> {
    const { family, parent } = await this.verifyFamilyAccess(familyId, user);

    // Check if email is already a parent in this family
    const existingParent = await this.parentModel.findOne({
      email: createInvitationDto.email.toLowerCase(),
      familyId: family._id,
    });

    if (existingParent) {
      throw new BadRequestException('This email is already a member of this family');
    }

    // Check for existing pending invitation
    const existingInvitation = await this.invitationModel.findOne({
      email: createInvitationDto.email.toLowerCase(),
      familyId: family._id,
      status: 'pending',
    });

    if (existingInvitation) {
      throw new BadRequestException('A pending invitation already exists for this email');
    }

    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = new this.invitationModel({
      familyId: family._id,
      email: createInvitationDto.email.toLowerCase(),
      role: createInvitationDto.role,
      status: 'pending',
      token: randomUUID(),
      sentAt: new Date(),
      expiresAt,
    });

    await invitation.save();

    // Add to family's invitationIds
    family.invitationIds.push(invitation._id as Types.ObjectId);
    await family.save();

    // Send email
    await this.emailService.sendInvitation({
      to: invitation.email,
      inviterName: parent.fullName,
      familyName: family.name,
      token: invitation.token,
      role: invitation.role,
    });

    return invitation;
  }

  async findByFamily(familyId: string, user: AuthUser): Promise<InvitationDocument[]> {
    await this.verifyFamilyAccess(familyId, user);

    return this.invitationModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .sort({ sentAt: -1 })
      .exec();
  }

  async resend(invitationId: string, user: AuthUser): Promise<InvitationDocument> {
    const invitation = await this.invitationModel.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${invitationId} not found`);
    }

    const { family, parent } = await this.verifyFamilyAccess(invitation.familyId.toString(), user);

    if (invitation.status !== 'pending' && invitation.status !== 'expired') {
      throw new BadRequestException('Can only resend pending or expired invitations');
    }

    // Update expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    invitation.status = 'pending';
    invitation.sentAt = new Date();
    invitation.expiresAt = expiresAt;
    invitation.token = randomUUID(); // Generate new token

    await invitation.save();

    // Resend email
    await this.emailService.sendInvitation({
      to: invitation.email,
      inviterName: parent.fullName,
      familyName: family.name,
      token: invitation.token,
      role: invitation.role,
    });

    return invitation;
  }

  async cancel(invitationId: string, user: AuthUser): Promise<InvitationDocument> {
    const invitation = await this.invitationModel.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${invitationId} not found`);
    }

    await this.verifyFamilyAccess(invitation.familyId.toString(), user);

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Can only cancel pending invitations');
    }

    invitation.status = 'canceled';
    invitation.canceledAt = new Date();

    await invitation.save();
    return invitation;
  }

  async accept(
    token: string,
    user: AuthUser,
  ): Promise<{ invitation: InvitationDocument; family: FamilyDocument }> {
    const invitation = await this.invitationModel.findOne({ token });

    if (!invitation) {
      throw new NotFoundException('Invalid or expired invitation token');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(`Invitation is ${invitation.status} and cannot be accepted`);
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await invitation.save();
      throw new BadRequestException('Invitation has expired');
    }

    // Check email matches
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException('This invitation was sent to a different email address');
    }

    const family = await this.familyModel.findById(invitation.familyId);
    if (!family) {
      throw new NotFoundException('Family no longer exists');
    }

    // Check if already a member
    const existingParent = await this.parentModel.findOne({
      auth0Id: user.auth0Id,
      familyId: family._id,
    });

    if (existingParent) {
      throw new BadRequestException('You are already a member of this family');
    }

    // Create parent record
    const parent = new this.parentModel({
      auth0Id: user.auth0Id,
      familyId: family._id,
      fullName: user.email.split('@')[0],
      email: user.email,
      role: invitation.role as ParentRole,
      status: 'active',
      lastSignedInAt: new Date(),
    });

    await parent.save();

    // Update family
    family.parentIds.push(parent._id as Types.ObjectId);
    await family.save();

    // Mark invitation as accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    return { invitation, family };
  }

  async checkAndExpireInvitations(): Promise<number> {
    const result = await this.invitationModel.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() },
      },
      {
        status: 'expired',
      },
    );

    return result.modifiedCount;
  }
}
