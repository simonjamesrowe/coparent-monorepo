import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['bank-account', 'credit-card'] })
  type!: 'bank-account' | 'credit-card';

  @Prop({ type: String, required: true })
  bankName!: string;

  @Prop({ type: String, required: true })
  accountName!: string;

  @Prop({ type: String, required: true })
  last4!: string;

  @Prop({ type: Types.ObjectId, ref: 'Parent', required: true })
  ownerParentId!: Types.ObjectId;

  @Prop({ type: String, enum: ['checking', 'savings'] })
  accountSubtype?: 'checking' | 'savings';

  @Prop({ type: String, enum: ['visa', 'mastercard', 'amex'] })
  cardType?: 'visa' | 'mastercard' | 'amex';

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

// Add indexes for common queries
AccountSchema.index({ familyId: 1, deletedAt: 1 });
AccountSchema.index({ familyId: 1, ownerParentId: 1, deletedAt: 1 });
