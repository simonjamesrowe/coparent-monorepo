import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ParentDocument = Parent & Document;

export type ParentRole = 'primary' | 'co-parent';
export type ParentStatus = 'active' | 'inactive';

@Schema({ timestamps: true })
export class Parent {
  @Prop({ required: true, index: true })
  auth0Id!: string;

  @Prop({ type: Types.ObjectId, ref: 'Family' })
  familyId!: Types.ObjectId;

  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ type: String, enum: ['primary', 'co-parent'], default: 'co-parent' })
  role!: ParentRole;

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  status!: ParentStatus;

  @Prop()
  color?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: Date })
  lastSignedInAt?: Date;
}

export const ParentSchema = SchemaFactory.createForClass(Parent);

// Add compound index for family + auth0Id queries
ParentSchema.index({ familyId: 1, auth0Id: 1 });
