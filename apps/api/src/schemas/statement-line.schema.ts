import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StatementLineDocument = StatementLine & Document;

@Schema({ timestamps: true })
export class StatementLine {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Statement', required: true })
  statementId!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop({ type: String, required: true })
  description!: string;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({ type: String, default: 'GBP' })
  currency!: string;

  @Prop({ type: String })
  categoryGuess?: string;

  @Prop({ type: Boolean, default: false })
  isChildExpense!: boolean;

  @Prop({ type: Boolean, default: false })
  requiresApproval!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Expense' })
  linkedExpenseId?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const StatementLineSchema = SchemaFactory.createForClass(StatementLine);

// Add indexes for common queries
StatementLineSchema.index({ familyId: 1, statementId: 1, deletedAt: 1 });
