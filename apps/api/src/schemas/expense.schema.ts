import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Child', default: null })
  childId!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Parent', required: true })
  createdByParentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ExpenseCategory', required: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop({ type: String, required: true })
  description!: string;

  @Prop({
    type: String,
    required: true,
    enum: ['draft', 'pending_approval', 'approved', 'reimbursed', 'denied'],
    default: 'draft',
  })
  status!: 'draft' | 'pending_approval' | 'approved' | 'reimbursed' | 'denied';

  @Prop({ type: Boolean, default: false })
  requiresApproval!: boolean;

  @Prop({
    type: String,
    required: true,
    enum: ['manual', 'statement'],
    default: 'manual',
  })
  source!: 'manual' | 'statement';

  @Prop({ type: Types.ObjectId, ref: 'StatementLine' })
  sourceStatementLineId?: Types.ObjectId;

  @Prop({ type: String })
  receiptUrl?: string;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

// Add indexes for common queries
ExpenseSchema.index({ familyId: 1, deletedAt: 1 });
ExpenseSchema.index({ familyId: 1, date: 1, deletedAt: 1 });
ExpenseSchema.index({ familyId: 1, status: 1, deletedAt: 1 });
ExpenseSchema.index({ familyId: 1, categoryId: 1, deletedAt: 1 });
