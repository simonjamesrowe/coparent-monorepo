import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OnboardingStateDocument = OnboardingState & Document;

export type OnboardingStep = 'account' | 'family' | 'child' | 'invite' | 'review' | 'complete';

@Schema({ timestamps: true })
export class OnboardingState {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true, unique: true })
  familyId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['account', 'family', 'child', 'invite', 'review', 'complete'],
    default: 'account',
  })
  currentStep!: OnboardingStep;

  @Prop({
    type: [String],
    enum: ['account', 'family', 'child', 'invite', 'review', 'complete'],
    default: [],
  })
  completedSteps!: OnboardingStep[];

  @Prop({ default: false })
  isComplete!: boolean;

  @Prop({ type: Date, default: Date.now })
  lastUpdated!: Date;
}

export const OnboardingStateSchema = SchemaFactory.createForClass(OnboardingState);
