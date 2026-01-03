import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventCategoryDocument = EventCategory & Document;

@Schema({ timestamps: true })
export class EventCategory {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  icon!: string;

  @Prop()
  color?: string;

  @Prop({ type: Boolean, default: false })
  isDefault!: boolean;

  @Prop({ type: Boolean, default: false })
  isSystem!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const EventCategorySchema = SchemaFactory.createForClass(EventCategory);

// Add index for family queries
EventCategorySchema.index({ familyId: 1, deletedAt: 1 });
