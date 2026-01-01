import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ParentRole } from './parent.schema';

export type InvitationDocument = Invitation & Document;

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'canceled';

@Schema({ timestamps: true })
export class Invitation {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ required: true })
  email!: string;

  @Prop({ type: String, enum: ['primary', 'co-parent'], default: 'co-parent' })
  role!: ParentRole;

  @Prop({
    type: String,
    enum: ['pending', 'accepted', 'expired', 'canceled'],
    default: 'pending',
  })
  status!: InvitationStatus;

  @Prop({ required: true, unique: true, index: true })
  token!: string;

  @Prop({ required: true, type: Date })
  sentAt!: Date;

  @Prop({ required: true, type: Date })
  expiresAt!: Date;

  @Prop({ type: Date })
  acceptedAt?: Date;

  @Prop({ type: Date })
  canceledAt?: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);

// Add index for family queries and token lookup
InvitationSchema.index({ familyId: 1, status: 1 });
InvitationSchema.index({ email: 1, status: 1 });
