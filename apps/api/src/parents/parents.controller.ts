import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ParentsService } from './parents.service';
import { UpdateParentRoleDto } from './dto/update-parent-role.dto';
import { AuthUser } from '../families/families.service';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@ApiTags('parents')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(AuthGuard('jwt'))
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get('families/:familyId/parents')
  @ApiOperation({ summary: 'Get all parents in a family' })
  @ApiResponse({ status: 200, description: 'Returns list of parents' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  async findByFamily(
    @Param('familyId') familyId: string,
    @Req() req: RequestWithUser,
  ) {
    const parents = await this.parentsService.findByFamily(familyId, req.user);
    return parents.map((parent) => ({
      id: parent._id,
      familyId: parent.familyId,
      fullName: parent.fullName,
      email: parent.email,
      role: parent.role,
      status: parent.status,
      color: parent.color,
      avatarUrl: parent.avatarUrl,
      lastSignedInAt: parent.lastSignedInAt,
    }));
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Req() req: RequestWithUser) {
    const parents = await this.parentsService.findCurrentUserWithFamilies(
      req.user,
    );

    if (parents.length === 0) {
      return {
        auth0Id: req.user.auth0Id,
        email: req.user.email,
        profiles: [],
        isNewUser: true,
      };
    }

    return {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
      profiles: parents.map((p) => ({
        id: p._id,
        familyId: p.familyId,
        fullName: p.fullName,
        role: p.role,
        status: p.status,
      })),
      isNewUser: false,
    };
  }

  @Post('me')
  @ApiOperation({ summary: 'Create initial user profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createProfile(
    @Body() body: { fullName: string },
    @Req() req: RequestWithUser,
  ) {
    const parent = await this.parentsService.createProfile(
      req.user,
      body.fullName,
    );
    return {
      id: parent._id,
      auth0Id: parent.auth0Id,
      email: parent.email,
      fullName: parent.fullName,
      role: parent.role,
      status: parent.status,
    };
  }

  @Patch('parents/:id/role')
  @ApiOperation({ summary: 'Update a parent role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized' })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateParentRoleDto,
    @Req() req: RequestWithUser,
  ) {
    const parent = await this.parentsService.updateRole(
      id,
      updateRoleDto.role,
      req.user,
    );
    return {
      id: parent._id,
      familyId: parent.familyId,
      fullName: parent.fullName,
      email: parent.email,
      role: parent.role,
      status: parent.status,
    };
  }
}
