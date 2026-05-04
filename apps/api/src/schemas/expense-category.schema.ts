import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseCategoryDocument = ExpenseCategory & Document;

@Schema({ timestamps: true })
export class ExpenseCategory {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true, enum: ['predefined', 'custom'] })
  type!: 'predefined' | 'custom';

  @Prop({ type: String, required: true })
  color!: string;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const ExpenseCategorySchema = SchemaFactory.createForClass(ExpenseCategory);

// Add indexes for common queries
ExpenseCategorySchema.index({ familyId: 1, deletedAt: 1 });
