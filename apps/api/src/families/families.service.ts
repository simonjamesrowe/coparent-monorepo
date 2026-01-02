import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Family, FamilyDocument } from '../schemas/family.schema';
import { Parent, ParentDocument } from '../schemas/parent.schema';
import { OnboardingState, OnboardingStateDocument } from '../schemas/onboarding-state.schema';
import { AuditService } from '../audit/audit.service';

import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';

export interface AuthUser {
  auth0Id: string;
  email: string;
  permissions?: string[];
}

@Injectable()
export class FamiliesService {
  constructor(
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
    @InjectModel(OnboardingState.name)
    private onboardingModel: Model<OnboardingStateDocument>,
    private auditService: AuditService,
  ) {}

  async create(createFamilyDto: CreateFamilyDto, user: AuthUser): Promise<FamilyDocument> {
    // Find existing parent profile (should exist after first login)
    const existingParent = await this.parentModel.findOne({ auth0Id: user.auth0Id });

    // Create the family
    const family = new this.familyModel({
      name: createFamilyDto.name,
      timeZone: createFamilyDto.timeZone,
    });
    await family.save();

    // Update parent to reference this family, set as primary, and update fullName if provided
    let parent = existingParent;
    if (!parent) {
      parent = new this.parentModel({
        auth0Id: user.auth0Id,
        email: user.email,
        fullName: createFamilyDto.fullName ?? '',
        role: 'primary',
        status: 'active',
        familyId: family._id as Types.ObjectId,
        lastSignedInAt: new Date(),
      });
    } else {
      parent.familyId = family._id as Types.ObjectId;
      parent.role = 'primary';
      if (createFamilyDto.fullName) {
        parent.fullName = createFamilyDto.fullName;
      }
    }
    await parent.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'parent',
      entityId: parent._id.toString(),
      action: existingParent ? 'link-family' : 'create-and-link',
      performedBy: user.auth0Id,
      changes: {
        role: parent.role,
        familyId: family._id.toString(),
        fullName: parent.fullName,
      },
    });

    // Link parent to family
    family.parentIds.push(parent._id as Types.ObjectId);
    await family.save();

    // Create onboarding state
    const onboarding = new this.onboardingModel({
      familyId: family._id,
      currentStep: 'child',
      completedSteps: ['family'],
      isComplete: false,
      lastUpdated: new Date(),
    });
    await onboarding.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'family',
      entityId: family._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: {
        name: family.name,
        timeZone: family.timeZone,
        parentId: parent._id.toString(),
      },
    });

    return family;
  }

  async findByUser(user: AuthUser): Promise<FamilyDocument[]> {
    // Find all parent records for this user
    const parents = await this.parentModel.find({ auth0Id: user.auth0Id });
    const familyIds = parents.map((p: ParentDocument) => p.familyId);

    // Return all families the user belongs to
    return this.familyModel
      .find({
        _id: { $in: familyIds },
        deletedAt: null,
      })
      .exec();
  }

  async findById(id: string, user: AuthUser): Promise<FamilyDocument> {
    const family = await this.familyModel.findOne({
      _id: new Types.ObjectId(id),
      deletedAt: null,
    });

    if (!family) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }

    // Check if user belongs to this family
    const parent = await this.parentModel.findOne({
      auth0Id: user.auth0Id,
      familyId: family._id,
    });

    if (!parent) {
      throw new ForbiddenException('You do not have access to this family');
    }

    return family;
  }

  async update(
    id: string,
    updateFamilyDto: UpdateFamilyDto,
    user: AuthUser,
  ): Promise<FamilyDocument> {
    // First verify access
    const family = await this.findById(id, user);

    // Update only provided fields
    const before = {
      name: family.name,
      timeZone: family.timeZone,
    };

    if (updateFamilyDto.name !== undefined) {
      family.name = updateFamilyDto.name;
    }
    if (updateFamilyDto.timeZone !== undefined) {
      family.timeZone = updateFamilyDto.timeZone;
    }

    await family.save();

    const after = {
      name: family.name,
      timeZone: family.timeZone,
    };

    await this.auditService.log({
      familyId: family._id,
      entityType: 'family',
      entityId: family._id.toString(),
      action: 'update',
      performedBy: user.auth0Id,
      changes: {
        before,
        after,
      },
    });

    return family;
  }

  async delete(id: string, user: AuthUser): Promise<void> {
    const family = await this.findById(id, user);

    // Soft delete
    family.deletedAt = new Date();
    await family.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'family',
      entityId: family._id.toString(),
      action: 'delete',
      performedBy: user.auth0Id,
      changes: {
        deletedAt: family.deletedAt,
      },
    });
  }
}
