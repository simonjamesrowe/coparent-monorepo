import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StatementDocument = Statement & Document;

@Schema({ timestamps: true })
export class Statement {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accountId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  fileName!: string;

  @Prop({ type: Date, required: true })
  uploadedAt!: Date;

  @Prop({ type: Date, required: true })
  periodStart!: Date;

  @Prop({ type: Date, required: true })
  periodEnd!: Date;

  @Prop({ type: Types.ObjectId, ref: 'CsvMappingTemplate' })
  mappingTemplateId?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const StatementSchema = SchemaFactory.createForClass(Statement);

// Add indexes for common queries
StatementSchema.index({ familyId: 1, deletedAt: 1 });
StatementSchema.index({ familyId: 1, accountId: 1, deletedAt: 1 });
