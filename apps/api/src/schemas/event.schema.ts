import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

export type EventType = string;

export interface RecurringPattern {
  frequency: 'daily' | 'weekly';
  days?: string[];
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  type!: EventType;

  @Prop({ required: true })
  title!: string;

  @Prop({ type: Date, required: true })
  startDate!: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop()
  startTime?: string;

  @Prop()
  endTime?: string;

  @Prop({ type: Boolean, default: true })
  allDay!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Parent', default: null })
  parentId!: Types.ObjectId | null;

  @Prop({ type: [Types.ObjectId], ref: 'Parent', default: [] })
  parentIds!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Child', default: [] })
  childIds!: Types.ObjectId[];

  @Prop()
  location?: string;

  @Prop({ type: String, default: null })
  notes!: string | null;

  @Prop({ type: Object, default: null })
  recurring!: RecurringPattern | null;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Add indexes for common queries
EventSchema.index({ familyId: 1, deletedAt: 1 });
EventSchema.index({ familyId: 1, startDate: 1, deletedAt: 1 });
EventSchema.index({ familyId: 1, parentId: 1, deletedAt: 1 });
