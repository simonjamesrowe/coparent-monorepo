import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Family, FamilySchema } from '../schemas/family.schema';
import { Parent, ParentSchema } from '../schemas/parent.schema';
import { OnboardingState, OnboardingStateSchema } from '../schemas/onboarding-state.schema';

import { FamiliesService } from './families.service';
import { FamiliesController } from './families.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Family.name, schema: FamilySchema },
      { name: Parent.name, schema: ParentSchema },
      { name: OnboardingState.name, schema: OnboardingStateSchema },
    ]),
  ],
  controllers: [FamiliesController],
  providers: [FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
