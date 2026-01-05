import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthUser } from '../families/families.service';

import { CreateMessageConversationDto } from './dto/create-message-conversation.dto';
import { CreatePermissionConversationDto } from './dto/create-permission-conversation.dto';
import { RespondPermissionDto } from './dto/respond-permission.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagingService } from './messaging.service';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@ApiTags('messaging')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(AuthGuard('jwt'))
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('families/:familyId/conversations')
  @ApiOperation({ summary: 'List conversations for a family' })
  @ApiResponse({ status: 200, description: 'Returns conversations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  async list(@Param('familyId') familyId: string, @Req() req: RequestWithUser) {
    return this.messagingService.listByFamily(familyId, req.user);
  }

  @Post('families/:familyId/conversations/message')
  @ApiOperation({ summary: 'Create a new message conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  async createMessageConversation(
    @Param('familyId') familyId: string,
    @Body() dto: CreateMessageConversationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.messagingService.createMessageConversation(familyId, dto, req.user);
  }

  @Post('families/:familyId/conversations/permission')
  @ApiOperation({ summary: 'Create a new permission request conversation' })
  @ApiResponse({ status: 201, description: 'Permission request created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  async createPermissionConversation(
    @Param('familyId') familyId: string,
    @Body() dto: CreatePermissionConversationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.messagingService.createPermissionConversation(familyId, dto, req.user);
  }

  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
    @Req() req: RequestWithUser,
  ) {
    return this.messagingService.sendMessage(conversationId, dto, req.user);
  }

  @Post('conversations/:conversationId/mark-read')
  @ApiOperation({ summary: 'Mark a conversation as read' })
  @ApiResponse({ status: 200, description: 'Conversation updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  async markRead(@Param('conversationId') conversationId: string, @Req() req: RequestWithUser) {
    return this.messagingService.markRead(conversationId, req.user);
  }

  @Post('conversations/:conversationId/mark-unread')
  @ApiOperation({ summary: 'Mark a conversation as unread' })
  @ApiResponse({ status: 200, description: 'Conversation updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  async markUnread(@Param('conversationId') conversationId: string, @Req() req: RequestWithUser) {
    return this.messagingService.markUnread(conversationId, req.user);
  }

  @Post('permissions/:permissionId/approve')
  @ApiOperation({ summary: 'Approve a permission request' })
  @ApiResponse({ status: 200, description: 'Permission approved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  async approvePermission(
    @Param('permissionId') permissionId: string,
    @Body() dto: RespondPermissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.messagingService.approvePermission(permissionId, dto, req.user);
  }

  @Post('permissions/:permissionId/deny')
  @ApiOperation({ summary: 'Deny a permission request' })
  @ApiResponse({ status: 200, description: 'Permission denied successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  async denyPermission(
    @Param('permissionId') permissionId: string,
    @Body() dto: RespondPermissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.messagingService.denyPermission(permissionId, dto, req.user);
  }
}
