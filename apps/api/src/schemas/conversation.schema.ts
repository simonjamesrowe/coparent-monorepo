import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

export type ConversationType = 'message' | 'permission';
export type PermissionType = 'medical' | 'travel' | 'schedule' | 'extracurricular';
export type PermissionStatus = 'pending' | 'approved' | 'denied';

@Schema({ _id: true })
export class ConversationMessage {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Parent', required: true })
  senderId!: Types.ObjectId;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: Date, required: true })
  timestamp!: Date;

  @Prop({ type: [Types.ObjectId], ref: 'Parent', default: [] })
  readBy!: Types.ObjectId[];
}

export const ConversationMessageSchema = SchemaFactory.createForClass(ConversationMessage);

@Schema({ _id: true })
export class PermissionRequest {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['medical', 'travel', 'schedule', 'extracurricular'],
    required: true,
  })
  type!: PermissionType;

  @Prop({ type: Types.ObjectId, ref: 'Child', required: true })
  childId!: Types.ObjectId;

  @Prop({ required: true })
  childName!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'Parent', required: true })
  requestedBy!: Types.ObjectId;

  @Prop({ type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' })
  status!: PermissionStatus;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date })
  resolvedAt?: Date | null;

  @Prop({ type: String })
  response?: string | null;
}

export const PermissionRequestSchema = SchemaFactory.createForClass(PermissionRequest);

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true, index: true })
  familyId!: Types.ObjectId;

  @Prop({ type: String, enum: ['message', 'permission'], required: true })
  type!: ConversationType;

  @Prop({ required: true })
  subject!: string;

  @Prop({ type: Types.ObjectId, ref: 'Parent', required: true })
  parent1Id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Parent', required: true })
  parent2Id!: Types.ObjectId;

  @Prop({ type: [ConversationMessageSchema], default: [] })
  messages!: ConversationMessage[];

  @Prop({ type: PermissionRequestSchema })
  permissionRequest?: PermissionRequest;

  @Prop({ type: Map, of: Number, default: {} })
  unreadCounts!: Map<string, number>;

  @Prop({ type: Date, required: true })
  lastMessageAt!: Date;

  @Prop({ type: Date })
  deletedAt?: Date | null;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({ familyId: 1, lastMessageAt: -1 });
