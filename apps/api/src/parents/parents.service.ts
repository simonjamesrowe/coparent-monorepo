import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Parent, ParentDocument, ParentRole } from '../schemas/parent.schema';
import { AuthUser } from '../families/families.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ParentsService {
  constructor(
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
    private auditService: AuditService,
  ) {}

  async findByFamily(familyId: string, user: AuthUser): Promise<ParentDocument[]> {
    // Verify user belongs to this family
    const userParent = await this.parentModel.findOne({
      auth0Id: user.auth0Id,
      familyId: new Types.ObjectId(familyId),
    });

    if (!userParent) {
      throw new ForbiddenException('You do not have access to this family');
    }

    return this.parentModel.find({ familyId: new Types.ObjectId(familyId) }).exec();
  }

  async findCurrentUser(user: AuthUser): Promise<ParentDocument | null> {
    return this.parentModel.findOne({ auth0Id: user.auth0Id }).exec();
  }

  async findCurrentUserWithFamilies(user: AuthUser): Promise<ParentDocument[]> {
    return this.parentModel.find({ auth0Id: user.auth0Id }).exec();
  }

  async createProfile(
    user: AuthUser,
    fullName: string,
    familyId?: string,
  ): Promise<ParentDocument> {
    const parentData: Partial<Parent> = {
      auth0Id: user.auth0Id,
      email: user.email,
      fullName,
      role: 'primary',
      status: 'active',
      lastSignedInAt: new Date(),
    };

    if (familyId) {
      parentData.familyId = new Types.ObjectId(familyId);
    }

    const parent = new this.parentModel(parentData);

    const savedParent = await parent.save();

    await this.auditService.log({
      familyId: savedParent.familyId ?? null,
      entityType: 'parent',
      entityId: savedParent._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: {
        fullName: savedParent.fullName,
        role: savedParent.role,
        status: savedParent.status,
      },
    });

    return savedParent;
  }

  async updateRole(parentId: string, role: ParentRole, user: AuthUser): Promise<ParentDocument> {
    const parent = await this.parentModel.findById(parentId);

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${parentId} not found`);
    }

    // Verify user belongs to the same family
    const userParent = await this.parentModel.findOne({
      auth0Id: user.auth0Id,
      familyId: parent.familyId,
    });

    if (!userParent) {
      throw new ForbiddenException('You do not have access to this family');
    }

    // Only primary parents can change roles
    if (userParent.role !== 'primary') {
      throw new ForbiddenException('Only primary parents can change roles');
    }

    parent.role = role;
    const savedParent = await parent.save();

    await this.auditService.log({
      familyId: savedParent.familyId,
      entityType: 'parent',
      entityId: savedParent._id.toString(),
      action: 'update-role',
      performedBy: user.auth0Id,
      changes: {
        role: savedParent.role,
      },
    });

    return savedParent;
  }

  async updateLastSignedIn(auth0Id: string): Promise<void> {
    await this.parentModel.updateMany({ auth0Id }, { lastSignedInAt: new Date() });
  }

  async createInitialProfile(auth0Id: string, email: string): Promise<ParentDocument> {
    const parent = new this.parentModel({
      auth0Id,
      email,
      fullName: '', // Will be set during onboarding
      role: 'co-parent', // Default, will be 'primary' when they create family
      status: 'active',
      familyId: null, // Not assigned to family yet
      lastSignedInAt: new Date(),
    });

    const savedParent = await parent.save();

    await this.auditService.log({
      familyId: savedParent.familyId ?? null,
      entityType: 'parent',
      entityId: savedParent._id.toString(),
      action: 'create-initial',
      performedBy: auth0Id,
      changes: {
        email: savedParent.email,
        role: savedParent.role,
        status: savedParent.status,
      },
    });

    return savedParent;
  }

  async updateCurrentUserProfile(
    auth0Id: string,
    updates: { fullName?: string },
  ): Promise<ParentDocument | null> {
    const updated = await this.parentModel
      .findOneAndUpdate({ auth0Id }, { $set: updates }, { new: true })
      .exec();

    if (updated) {
      await this.auditService.log({
        familyId: updated.familyId ?? null,
        entityType: 'parent',
        entityId: updated._id.toString(),
        action: 'update-profile',
        performedBy: auth0Id,
        changes: updates,
      });
    }

    return updated;
  }
}
