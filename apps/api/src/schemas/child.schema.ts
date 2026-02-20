import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChildDocument = Child & Document;

@Schema({ timestamps: true })
export class Child {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  fullName!: string;

  @Prop({ required: true, type: Date })
  dateOfBirth!: Date;

  @Prop({ type: String })
  school?: string;

  @Prop({ type: String })
  medicalNotes?: string;

  @Prop({ type: String })
  avatarUrl?: string;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const ChildSchema = SchemaFactory.createForClass(Child);

// Add index for family queries
ChildSchema.index({ familyId: 1, deletedAt: 1 });
