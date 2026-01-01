import { Controller, Get, Patch, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthUser } from '../families/families.service';
import { OnboardingStep } from '../schemas/onboarding-state.schema';

import { OnboardingService } from './onboarding.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@ApiTags('onboarding')
@ApiBearerAuth('JWT-auth')
@Controller('onboarding')
@UseGuards(AuthGuard('jwt'))
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get(':familyId')
  @ApiOperation({ summary: 'Get onboarding state for a family' })
  @ApiResponse({ status: 200, description: 'Returns onboarding state' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async findByFamily(@Param('familyId') familyId: string, @Req() req: RequestWithUser) {
    const onboarding = await this.onboardingService.findByFamily(familyId, req.user);

    if (!onboarding) {
      return {
        familyId,
        currentStep: 'account',
        completedSteps: [],
        isComplete: false,
        lastUpdated: null,
      };
    }

    return {
      id: onboarding._id,
      familyId: onboarding.familyId,
      currentStep: onboarding.currentStep,
      completedSteps: onboarding.completedSteps,
      isComplete: onboarding.isComplete,
      lastUpdated: onboarding.lastUpdated,
    };
  }

  @Patch(':familyId')
  @ApiOperation({ summary: 'Update onboarding state' })
  @ApiResponse({ status: 200, description: 'Onboarding state updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async update(
    @Param('familyId') familyId: string,
    @Body() updateDto: UpdateOnboardingDto,
    @Req() req: RequestWithUser,
  ) {
    const onboarding = await this.onboardingService.update(familyId, updateDto, req.user);
    return {
      id: onboarding._id,
      familyId: onboarding.familyId,
      currentStep: onboarding.currentStep,
      completedSteps: onboarding.completedSteps,
      isComplete: onboarding.isComplete,
      lastUpdated: onboarding.lastUpdated,
    };
  }

  @Post(':familyId/complete-step')
  @ApiOperation({ summary: 'Mark a step as complete and advance' })
  @ApiResponse({ status: 200, description: 'Step completed' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Family or onboarding not found' })
  async completeStep(
    @Param('familyId') familyId: string,
    @Body() body: { step: OnboardingStep },
    @Req() req: RequestWithUser,
  ) {
    const onboarding = await this.onboardingService.completeStep(familyId, body.step, req.user);
    return {
      id: onboarding._id,
      familyId: onboarding.familyId,
      currentStep: onboarding.currentStep,
      completedSteps: onboarding.completedSteps,
      isComplete: onboarding.isComplete,
      lastUpdated: onboarding.lastUpdated,
    };
  }
}
