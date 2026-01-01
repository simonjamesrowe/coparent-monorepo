import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { FamiliesService, AuthUser } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@ApiTags('families')
@ApiBearerAuth('JWT-auth')
@Controller('families')
@UseGuards(AuthGuard('jwt'))
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family' })
  @ApiResponse({ status: 201, description: 'Family created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createFamilyDto: CreateFamilyDto, @Req() req: RequestWithUser) {
    const family = await this.familiesService.create(createFamilyDto, req.user);
    return {
      id: family._id,
      name: family.name,
      timeZone: family.timeZone,
      parentIds: family.parentIds,
      childIds: family.childIds,
      invitationIds: family.invitationIds,
      createdAt: (family as any).createdAt,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all families for the current user' })
  @ApiResponse({ status: 200, description: 'Returns list of families' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Req() req: RequestWithUser) {
    const families = await this.familiesService.findByUser(req.user);
    return families.map((family) => ({
      id: family._id,
      name: family.name,
      timeZone: family.timeZone,
      parentIds: family.parentIds,
      childIds: family.childIds,
      invitationIds: family.invitationIds,
      createdAt: (family as any).createdAt,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific family by ID' })
  @ApiResponse({ status: 200, description: 'Returns the family' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const family = await this.familiesService.findById(id, req.user);
    return {
      id: family._id,
      name: family.name,
      timeZone: family.timeZone,
      parentIds: family.parentIds,
      childIds: family.childIds,
      invitationIds: family.invitationIds,
      createdAt: (family as any).createdAt,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a family' })
  @ApiResponse({ status: 200, description: 'Family updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async update(
    @Param('id') id: string,
    @Body() updateFamilyDto: UpdateFamilyDto,
    @Req() req: RequestWithUser,
  ) {
    const family = await this.familiesService.update(id, updateFamilyDto, req.user);
    return {
      id: family._id,
      name: family.name,
      timeZone: family.timeZone,
      parentIds: family.parentIds,
      childIds: family.childIds,
      invitationIds: family.invitationIds,
      createdAt: (family as any).createdAt,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a family (soft delete)' })
  @ApiResponse({ status: 200, description: 'Family deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.familiesService.delete(id, req.user);
    return { message: 'Family deleted successfully' };
  }
}
