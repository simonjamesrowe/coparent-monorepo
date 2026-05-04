import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CsvMappingTemplateDocument = CsvMappingTemplate & Document;

export interface CsvMappings {
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  categoryColumn: string;
}

@Schema({ timestamps: true })
export class CsvMappingTemplate {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  accountId?: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Object, required: true })
  mappings!: CsvMappings;

  @Prop({ type: String, default: ',' })
  delimiter!: string;

  @Prop({ type: Boolean, default: true })
  hasHeaderRow!: boolean;

  @Prop({ type: Boolean, default: false })
  isPreset!: boolean;

  @Prop({ type: String })
  bankNameMatch?: string;

  @Prop({ type: String })
  accountTypeMatch?: string;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const CsvMappingTemplateSchema = SchemaFactory.createForClass(CsvMappingTemplate);

// Add indexes for common queries
CsvMappingTemplateSchema.index({ familyId: 1, deletedAt: 1 });
CsvMappingTemplateSchema.index({ isPreset: 1 });
