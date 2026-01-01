import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Family, FamilyDocument } from '../schemas/family.schema';
import { Parent, ParentDocument } from '../schemas/parent.schema';
import { OnboardingState, OnboardingStateDocument } from '../schemas/onboarding-state.schema';

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
  ) {}

  async create(createFamilyDto: CreateFamilyDto, user: AuthUser): Promise<FamilyDocument> {
    // Create the family
    const family = new this.familyModel({
      name: createFamilyDto.name,
      timeZone: createFamilyDto.timeZone,
    });
    await family.save();

    // Create parent record for the creating user (as primary)
    const parent = new this.parentModel({
      auth0Id: user.auth0Id,
      familyId: family._id,
      fullName: user.email.split('@')[0], // Default name from email
      email: user.email,
      role: 'primary',
      status: 'active',
      lastSignedInAt: new Date(),
    });
    await parent.save();

    // Link parent to family
    family.parentIds.push(parent._id as Types.ObjectId);
    await family.save();

    // Create onboarding state
    const onboarding = new this.onboardingModel({
      familyId: family._id,
      currentStep: 'family',
      completedSteps: ['account'],
      isComplete: false,
      lastUpdated: new Date(),
    });
    await onboarding.save();

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
    if (updateFamilyDto.name !== undefined) {
      family.name = updateFamilyDto.name;
    }
    if (updateFamilyDto.timeZone !== undefined) {
      family.timeZone = updateFamilyDto.timeZone;
    }

    await family.save();
    return family;
  }

  async delete(id: string, user: AuthUser): Promise<void> {
    const family = await this.findById(id, user);

    // Soft delete
    family.deletedAt = new Date();
    await family.save();
  }
}
