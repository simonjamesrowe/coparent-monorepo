import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean, IsArray } from 'class-validator';

const STEPS = ['account', 'family', 'child', 'invite', 'review', 'complete'] as const;
type OnboardingStep = (typeof STEPS)[number];

export class UpdateOnboardingDto {
  @ApiPropertyOptional({
    description: 'Current step in the onboarding process',
    enum: STEPS,
    example: 'child',
  })
  @IsOptional()
  @IsEnum(STEPS)
  currentStep?: OnboardingStep;

  @ApiPropertyOptional({
    description: 'List of completed steps',
    enum: STEPS,
    isArray: true,
    example: ['account', 'family'],
  })
  @IsOptional()
  @IsArray()
  completedSteps?: OnboardingStep[];

  @ApiPropertyOptional({
    description: 'Whether onboarding is complete',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isComplete?: boolean;
}
