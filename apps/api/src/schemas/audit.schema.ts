import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditDocument = Audit & Document;

@Schema({ timestamps: true })
export class Audit {
  @Prop({ type: Types.ObjectId, ref: 'Family' })
  familyId?: Types.ObjectId | null;

  @Prop({ type: String, required: true })
  entityType!: string;

  @Prop({ type: String, required: true })
  entityId!: string;

  @Prop({ type: String, required: true })
  action!: string;

  @Prop({ type: String, required: true, index: true })
  performedBy!: string;

  @Prop({ type: Object, default: {} })
  changes!: Record<string, unknown>;

  @Prop({ type: Date, default: Date.now })
  timestamp!: Date;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);

AuditSchema.index({ familyId: 1, timestamp: -1 });
AuditSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
