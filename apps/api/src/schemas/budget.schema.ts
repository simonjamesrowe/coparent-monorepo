import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BudgetDocument = Budget & Document;

@Schema({ timestamps: true })
export class Budget {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ExpenseCategory', required: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  month!: string;

  @Prop({ type: Number, required: true })
  limit!: number;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);

// Add indexes for common queries
BudgetSchema.index({ familyId: 1, deletedAt: 1 });
BudgetSchema.index({ familyId: 1, categoryId: 1, month: 1 }, { unique: true });
