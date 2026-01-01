import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import {
  OnboardingState,
  OnboardingStateSchema,
} from '../schemas/onboarding-state.schema';
import { Family, FamilySchema } from '../schemas/family.schema';
import { Parent, ParentSchema } from '../schemas/parent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnboardingState.name, schema: OnboardingStateSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Parent.name, schema: ParentSchema },
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
