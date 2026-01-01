import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AuthUser } from '../families/families.service';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@ApiTags('invitations')
@ApiBearerAuth('JWT-auth')
@Controller()
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('families/:familyId/invitations')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Send an invitation to a co-parent' })
  @ApiResponse({ status: 201, description: 'Invitation sent successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async create(
    @Param('familyId') familyId: string,
    @Body() createInvitationDto: CreateInvitationDto,
    @Req() req: RequestWithUser,
  ) {
    const invitation = await this.invitationsService.create(
      familyId,
      createInvitationDto,
      req.user,
    );
    return {
      id: invitation._id,
      familyId: invitation.familyId,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      sentAt: invitation.sentAt,
      expiresAt: invitation.expiresAt,
    };
  }

  @Get('families/:familyId/invitations')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all invitations for a family' })
  @ApiResponse({ status: 200, description: 'Returns list of invitations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  async findByFamily(
    @Param('familyId') familyId: string,
    @Req() req: RequestWithUser,
  ) {
    const invitations = await this.invitationsService.findByFamily(
      familyId,
      req.user,
    );
    return invitations.map((inv) => ({
      id: inv._id,
      familyId: inv.familyId,
      email: inv.email,
      role: inv.role,
      status: inv.status,
      sentAt: inv.sentAt,
      expiresAt: inv.expiresAt,
      acceptedAt: inv.acceptedAt,
      canceledAt: inv.canceledAt,
    }));
  }

  @Post('invitations/:id/resend')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Resend an invitation email' })
  @ApiResponse({ status: 200, description: 'Invitation resent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid invitation status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async resend(@Param('id') id: string, @Req() req: RequestWithUser) {
    const invitation = await this.invitationsService.resend(id, req.user);
    return {
      id: invitation._id,
      familyId: invitation.familyId,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      sentAt: invitation.sentAt,
      expiresAt: invitation.expiresAt,
    };
  }

  @Post('invitations/:id/cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Cancel a pending invitation' })
  @ApiResponse({ status: 200, description: 'Invitation canceled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid invitation status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async cancel(@Param('id') id: string, @Req() req: RequestWithUser) {
    const invitation = await this.invitationsService.cancel(id, req.user);
    return {
      id: invitation._id,
      familyId: invitation.familyId,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      canceledAt: invitation.canceledAt,
    };
  }

  @Post('invitations/accept')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Accept an invitation using token' })
  @ApiQuery({ name: 'token', description: 'Invitation token from email' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Email mismatch' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async accept(@Query('token') token: string, @Req() req: RequestWithUser) {
    const { invitation, family } = await this.invitationsService.accept(
      token,
      req.user,
    );
    return {
      message: 'Invitation accepted successfully',
      invitation: {
        id: invitation._id,
        status: invitation.status,
        acceptedAt: invitation.acceptedAt,
      },
      family: {
        id: family._id,
        name: family.name,
      },
    };
  }
}
