import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  OnboardingState,
  OnboardingStateDocument,
  OnboardingStep,
} from '../schemas/onboarding-state.schema';
import { Family, FamilyDocument } from '../schemas/family.schema';
import { Parent, ParentDocument } from '../schemas/parent.schema';
import { AuthUser } from '../families/families.service';
import { AuditService } from '../audit/audit.service';

import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(OnboardingState.name)
    private onboardingModel: Model<OnboardingStateDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
    private auditService: AuditService,
  ) {}

  private async verifyFamilyAccess(familyId: string, user: AuthUser): Promise<FamilyDocument> {
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

    return family;
  }

  async findByFamily(familyId: string, user: AuthUser): Promise<OnboardingStateDocument | null> {
    await this.verifyFamilyAccess(familyId, user);

    return this.onboardingModel.findOne({ familyId: new Types.ObjectId(familyId) }).exec();
  }

  async update(
    familyId: string,
    updateDto: UpdateOnboardingDto,
    user: AuthUser,
  ): Promise<OnboardingStateDocument> {
    await this.verifyFamilyAccess(familyId, user);

    let onboarding = await this.onboardingModel.findOne({
      familyId: new Types.ObjectId(familyId),
    });

    if (!onboarding) {
      // Create if doesn't exist
      onboarding = new this.onboardingModel({
        familyId: new Types.ObjectId(familyId),
        currentStep: 'account',
        completedSteps: [],
        isComplete: false,
        lastUpdated: new Date(),
      });
    }

    if (updateDto.currentStep !== undefined) {
      onboarding.currentStep = updateDto.currentStep;
    }

    if (updateDto.completedSteps !== undefined) {
      onboarding.completedSteps = updateDto.completedSteps as OnboardingStep[];
    }

    if (updateDto.isComplete !== undefined) {
      onboarding.isComplete = updateDto.isComplete;
      if (updateDto.isComplete) {
        onboarding.currentStep = 'complete';
      }
    }

    onboarding.lastUpdated = new Date();
    await onboarding.save();

    await this.auditService.log({
      familyId: onboarding.familyId,
      entityType: 'onboarding',
      entityId: onboarding._id.toString(),
      action: 'update',
      performedBy: user.auth0Id,
      changes: {
        currentStep: onboarding.currentStep,
        completedSteps: onboarding.completedSteps,
        isComplete: onboarding.isComplete,
      },
    });

    return onboarding;
  }

  async completeStep(
    familyId: string,
    step: OnboardingStep,
    user: AuthUser,
  ): Promise<OnboardingStateDocument> {
    await this.verifyFamilyAccess(familyId, user);

    const onboarding = await this.onboardingModel.findOne({
      familyId: new Types.ObjectId(familyId),
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding state not found');
    }

    // Add step to completed if not already there
    if (!onboarding.completedSteps.includes(step)) {
      onboarding.completedSteps.push(step);
    }

    // Move to next step
    const stepOrder: OnboardingStep[] = [
      'account',
      'family',
      'child',
      'invite',
      'review',
      'complete',
    ];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      onboarding.currentStep = stepOrder[currentIndex + 1];
    }

    // Check if complete
    if (step === 'review') {
      onboarding.isComplete = true;
      onboarding.currentStep = 'complete';
    }

    onboarding.lastUpdated = new Date();
    await onboarding.save();

    await this.auditService.log({
      familyId: onboarding.familyId,
      entityType: 'onboarding',
      entityId: onboarding._id.toString(),
      action: 'complete-step',
      performedBy: user.auth0Id,
      changes: {
        step,
        currentStep: onboarding.currentStep,
        completedSteps: onboarding.completedSteps,
        isComplete: onboarding.isComplete,
      },
    });

    return onboarding;
  }
}
