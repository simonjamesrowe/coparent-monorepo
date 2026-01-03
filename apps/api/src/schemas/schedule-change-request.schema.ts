import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScheduleChangeRequestDocument = ScheduleChangeRequest & Document;

export type ScheduleChangeRequestStatus = 'pending' | 'approved' | 'declined';
export type ChangeType = 'swap' | 'extend' | 'add' | 'remove';

export interface ProposedChange {
  type: ChangeType;
  originalStartDate?: string;
  originalEndDate?: string;
  newStartDate: string;
  newEndDate: string;
}

@Schema({ timestamps: true })
export class ScheduleChangeRequest {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending',
  })
  status!: ScheduleChangeRequestStatus;

  @Prop({ type: Types.ObjectId, ref: 'Parent', required: true })
  requestedBy!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  requestedAt!: Date;

  @Prop({ type: Types.ObjectId, ref: 'Parent', default: null })
  resolvedBy!: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  resolvedAt!: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'Event', default: null })
  originalEventId!: Types.ObjectId | null;

  @Prop({ type: Object, required: true })
  proposedChange!: ProposedChange;

  @Prop({ required: true })
  reason!: string;

  @Prop({ type: String, default: null })
  responseNote!: string | null;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const ScheduleChangeRequestSchema = SchemaFactory.createForClass(ScheduleChangeRequest);

// Add indexes for common queries
ScheduleChangeRequestSchema.index({ familyId: 1, deletedAt: 1 });
ScheduleChangeRequestSchema.index({ familyId: 1, status: 1, deletedAt: 1 });
ScheduleChangeRequestSchema.index({ requestedBy: 1, status: 1 });
