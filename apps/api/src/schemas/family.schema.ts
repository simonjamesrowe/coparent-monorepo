import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FamilyDocument = Family & Document;

@Schema({ timestamps: true })
export class Family {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  timeZone!: string;

  @Prop({ type: [Types.ObjectId], ref: 'Parent', default: [] })
  parentIds!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Child', default: [] })
  childIds!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Invitation', default: [] })
  invitationIds!: Types.ObjectId[];

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const FamilySchema = SchemaFactory.createForClass(Family);

// Add index for soft delete queries
FamilySchema.index({ deletedAt: 1 });
