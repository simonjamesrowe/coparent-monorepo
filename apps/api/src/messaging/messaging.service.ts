import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AuditService } from '../audit/audit.service';
import { AuthUser } from '../families/families.service';
import { Child, ChildDocument } from '../schemas/child.schema';
import {
  Conversation,
  ConversationDocument,
  PermissionRequest,
} from '../schemas/conversation.schema';
import { Family, FamilyDocument } from '../schemas/family.schema';
import { Parent, ParentDocument } from '../schemas/parent.schema';

import { CreateMessageConversationDto } from './dto/create-message-conversation.dto';
import { CreatePermissionConversationDto } from './dto/create-permission-conversation.dto';
import { RespondPermissionDto } from './dto/respond-permission.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    private auditService: AuditService,
  ) {}

  private async verifyFamilyAccess(
    familyId: string,
    user: AuthUser,
  ): Promise<{ family: FamilyDocument; parent: ParentDocument }> {
    const family = await this.familyModel.findOne({
      _id: new Types.ObjectId(familyId),
      deletedAt: null,
    });

    if (!family) {
      throw new NotFoundException(`Family with ID ${familyId} not found`);
    }

    const parent = await this.parentModel.findOne({
      auth0Id: user.auth0Id,
      familyId: family._id,
    });

    if (!parent) {
      throw new ForbiddenException('You do not have access to this family');
    }

    return { family, parent };
  }

  private async getParentMap(familyId: Types.ObjectId) {
    const parents = await this.parentModel.find({ familyId });
    return new Map(parents.map((parent) => [parent._id.toString(), parent]));
  }

  private formatConversation(
    conversation: ConversationDocument,
    currentParentId: string,
    parentMap: Map<string, ParentDocument>,
  ) {
    const getParticipant = (parentId: Types.ObjectId) => {
      const parent = parentMap.get(parentId.toString());
      return {
        id: parentId.toString(),
        name: parent?.fullName || 'Parent',
        avatarUrl: parent?.avatarUrl ?? null,
      };
    };

    const unreadCount = conversation.unreadCounts?.get(currentParentId) ?? 0;

    const messages =
      conversation.type === 'message'
        ? (conversation.messages ?? []).map((message) => ({
            id: message._id.toString(),
            senderId: message.senderId.toString(),
            content: message.content,
            timestamp: message.timestamp.toISOString(),
            isRead: message.readBy?.some((id) => id.toString() === currentParentId) ?? false,
          }))
        : undefined;

    const permissionRequest = conversation.permissionRequest
      ? {
          id: conversation.permissionRequest._id.toString(),
          type: conversation.permissionRequest.type,
          childId: conversation.permissionRequest.childId.toString(),
          childName: conversation.permissionRequest.childName,
          description: conversation.permissionRequest.description,
          requestedBy: conversation.permissionRequest.requestedBy.toString(),
          status: conversation.permissionRequest.status,
          createdAt: conversation.permissionRequest.createdAt.toISOString(),
          resolvedAt: conversation.permissionRequest.resolvedAt
            ? conversation.permissionRequest.resolvedAt.toISOString()
            : null,
          response: conversation.permissionRequest.response ?? null,
        }
      : undefined;

    return {
      id: conversation._id.toString(),
      type: conversation.type,
      subject: conversation.subject,
      lastMessageAt: conversation.lastMessageAt.toISOString(),
      unreadCount,
      participants: {
        parent1: getParticipant(conversation.parent1Id),
        parent2: getParticipant(conversation.parent2Id),
      },
      messages,
      permissionRequest,
    };
  }

  private ensureUnreadCounts(conversation: ConversationDocument) {
    if (!conversation.unreadCounts) {
      conversation.unreadCounts = new Map<string, number>();
    }
    return conversation.unreadCounts;
  }

  private getOtherParentId(conversation: ConversationDocument, currentParentId: string) {
    if (conversation.parent1Id.toString() === currentParentId) {
      return conversation.parent2Id.toString();
    }
    if (conversation.parent2Id.toString() === currentParentId) {
      return conversation.parent1Id.toString();
    }
    return null;
  }

  async listByFamily(familyId: string, user: AuthUser) {
    const { family, parent } = await this.verifyFamilyAccess(familyId, user);
    const conversations = await this.conversationModel
      .find({ familyId: family._id, deletedAt: null })
      .sort({ lastMessageAt: -1 })
      .exec();
    const parentMap = await this.getParentMap(family._id);
    const currentParentId = parent._id.toString();

    return conversations.map((conversation) =>
      this.formatConversation(conversation, currentParentId, parentMap),
    );
  }

  async createMessageConversation(
    familyId: string,
    dto: CreateMessageConversationDto,
    user: AuthUser,
  ) {
    const { family, parent } = await this.verifyFamilyAccess(familyId, user);
    const parents = await this.parentModel.find({ familyId: family._id });

    const recipient = dto.recipientId
      ? parents.find((item) => item._id.toString() === dto.recipientId)
      : parents.find((item) => item._id.toString() !== parent._id.toString());

    if (!recipient || recipient._id.toString() === parent._id.toString()) {
      throw new BadRequestException('A co-parent recipient is required');
    }

    const messageContent = dto.message.trim();
    if (!messageContent) {
      throw new BadRequestException('Message content is required');
    }

    const now = new Date();
    const message = {
      senderId: parent._id,
      content: messageContent,
      timestamp: now,
      readBy: [parent._id],
    };

    const conversation = new this.conversationModel({
      familyId: family._id,
      type: 'message',
      subject: dto.subject?.trim() || 'New conversation',
      parent1Id: parent._id,
      parent2Id: recipient._id,
      messages: [message],
      lastMessageAt: now,
      unreadCounts: new Map([
        [parent._id.toString(), 0],
        [recipient._id.toString(), 1],
      ]),
    });

    await conversation.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'conversation',
      entityId: conversation._id.toString(),
      action: 'create-message-thread',
      performedBy: user.auth0Id,
      changes: {
        subject: conversation.subject,
        recipientId: recipient._id.toString(),
      },
    });

    const parentMap = await this.getParentMap(family._id);
    return this.formatConversation(conversation, parent._id.toString(), parentMap);
  }

  async createPermissionConversation(
    familyId: string,
    dto: CreatePermissionConversationDto,
    user: AuthUser,
  ) {
    const { family, parent } = await this.verifyFamilyAccess(familyId, user);
    const parents = await this.parentModel.find({ familyId: family._id });

    const recipient = parents.find((item) => item._id.toString() !== parent._id.toString());
    if (!recipient) {
      throw new BadRequestException('A co-parent recipient is required');
    }

    if (!dto.childId) {
      throw new BadRequestException('A child is required for permission requests');
    }

    const child = await this.childModel.findOne({
      _id: new Types.ObjectId(dto.childId),
      familyId: family._id,
      deletedAt: null,
    });

    if (!child) {
      throw new NotFoundException('Child not found for permission request');
    }

    const now = new Date();
    const description = dto.description.trim();
    if (!description) {
      throw new BadRequestException('Permission request description is required');
    }

    const permissionRequest: PermissionRequest = {
      _id: new Types.ObjectId(),
      type: dto.type,
      childId: child._id,
      childName: child.fullName,
      description,
      requestedBy: parent._id,
      status: 'pending',
      createdAt: now,
      resolvedAt: null,
      response: null,
    };

    const conversation = new this.conversationModel({
      familyId: family._id,
      type: 'permission',
      subject: dto.subject?.trim() || 'Permission request',
      parent1Id: parent._id,
      parent2Id: recipient._id,
      permissionRequest,
      lastMessageAt: now,
      unreadCounts: new Map([
        [parent._id.toString(), 0],
        [recipient._id.toString(), 1],
      ]),
    });

    await conversation.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'permission-request',
      entityId: permissionRequest._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: {
        subject: conversation.subject,
        type: permissionRequest.type,
        childId: child._id.toString(),
      },
    });

    const parentMap = await this.getParentMap(family._id);
    return this.formatConversation(conversation, parent._id.toString(), parentMap);
  }

  async sendMessage(conversationId: string, dto: SendMessageDto, user: AuthUser) {
    const conversation = await this.conversationModel.findOne({
      _id: new Types.ObjectId(conversationId),
      deletedAt: null,
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    const { parent } = await this.verifyFamilyAccess(conversation.familyId.toString(), user);
    const currentParentId = parent._id.toString();

    const content = dto.content.trim();
    if (!content) {
      throw new BadRequestException('Message content is required');
    }

    const now = new Date();
    conversation.messages.push({
      _id: new Types.ObjectId(),
      senderId: parent._id,
      content,
      timestamp: now,
      readBy: [parent._id],
    });
    conversation.lastMessageAt = now;

    const unreadCounts = this.ensureUnreadCounts(conversation);
    unreadCounts.set(currentParentId, 0);

    const otherParentId = this.getOtherParentId(conversation, currentParentId);
    if (otherParentId) {
      unreadCounts.set(otherParentId, (unreadCounts.get(otherParentId) ?? 0) + 1);
    }

    await conversation.save();

    await this.auditService.log({
      familyId: conversation.familyId,
      entityType: 'message',
      entityId: conversation._id.toString(),
      action: 'send',
      performedBy: user.auth0Id,
      changes: {
        contentLength: dto.content.trim().length,
      },
    });

    const parentMap = await this.getParentMap(conversation.familyId);
    return this.formatConversation(conversation, currentParentId, parentMap);
  }

  async markRead(conversationId: string, user: AuthUser) {
    const conversation = await this.conversationModel.findOne({
      _id: new Types.ObjectId(conversationId),
      deletedAt: null,
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    const { parent } = await this.verifyFamilyAccess(conversation.familyId.toString(), user);
    const currentParentId = parent._id.toString();

    conversation.messages.forEach((message) => {
      const alreadyRead = message.readBy?.some((id) => id.toString() === currentParentId);
      if (!alreadyRead) {
        message.readBy.push(parent._id);
      }
    });

    const unreadCounts = this.ensureUnreadCounts(conversation);
    unreadCounts.set(currentParentId, 0);

    await conversation.save();

    const parentMap = await this.getParentMap(conversation.familyId);
    return this.formatConversation(conversation, currentParentId, parentMap);
  }

  async markUnread(conversationId: string, user: AuthUser) {
    const conversation = await this.conversationModel.findOne({
      _id: new Types.ObjectId(conversationId),
      deletedAt: null,
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    const { parent } = await this.verifyFamilyAccess(conversation.familyId.toString(), user);
    const currentParentId = parent._id.toString();

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (lastMessage) {
      lastMessage.readBy = (lastMessage.readBy ?? []).filter(
        (id) => id.toString() !== currentParentId,
      );
    }

    const unreadCounts = this.ensureUnreadCounts(conversation);
    unreadCounts.set(currentParentId, 1);

    await conversation.save();

    const parentMap = await this.getParentMap(conversation.familyId);
    return this.formatConversation(conversation, currentParentId, parentMap);
  }

  private async resolvePermission(
    permissionId: string,
    dto: RespondPermissionDto,
    status: 'approved' | 'denied',
    user: AuthUser,
  ) {
    const conversation = await this.conversationModel.findOne({
      'permissionRequest._id': new Types.ObjectId(permissionId),
      deletedAt: null,
    });

    if (!conversation || !conversation.permissionRequest) {
      throw new NotFoundException(`Permission request with ID ${permissionId} not found`);
    }

    const { parent } = await this.verifyFamilyAccess(conversation.familyId.toString(), user);
    const currentParentId = parent._id.toString();

    conversation.permissionRequest.status = status;
    conversation.permissionRequest.response = dto.response?.trim() || null;
    conversation.permissionRequest.resolvedAt = new Date();
    conversation.lastMessageAt = conversation.permissionRequest.resolvedAt;

    const unreadCounts = this.ensureUnreadCounts(conversation);
    unreadCounts.set(currentParentId, 0);

    const requesterId = conversation.permissionRequest.requestedBy.toString();
    if (requesterId !== currentParentId) {
      unreadCounts.set(requesterId, (unreadCounts.get(requesterId) ?? 0) + 1);
    }

    await conversation.save();

    await this.auditService.log({
      familyId: conversation.familyId,
      entityType: 'permission-request',
      entityId: permissionId,
      action: status,
      performedBy: user.auth0Id,
      changes: {
        responseProvided: !!dto.response?.trim(),
      },
    });

    const parentMap = await this.getParentMap(conversation.familyId);
    return this.formatConversation(conversation, currentParentId, parentMap);
  }

  async approvePermission(permissionId: string, dto: RespondPermissionDto, user: AuthUser) {
    return this.resolvePermission(permissionId, dto, 'approved', user);
  }

  async denyPermission(permissionId: string, dto: RespondPermissionDto, user: AuthUser) {
    return this.resolvePermission(permissionId, dto, 'denied', user);
  }
}
