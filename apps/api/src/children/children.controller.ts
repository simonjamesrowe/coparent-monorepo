import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthUser } from '../families/families.service';

import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@ApiTags('children')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(AuthGuard('jwt'))
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post('families/:familyId/children')
  @ApiOperation({ summary: 'Add a child to a family' })
  @ApiResponse({ status: 201, description: 'Child created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async create(
    @Param('familyId') familyId: string,
    @Body() createChildDto: CreateChildDto,
    @Req() req: RequestWithUser,
  ) {
    const child = await this.childrenService.create(familyId, createChildDto, req.user);
    return {
      id: child._id,
      familyId: child.familyId,
      fullName: child.fullName,
      dateOfBirth: child.dateOfBirth.toISOString().split('T')[0],
      school: child.school,
      medicalNotes: child.medicalNotes,
    };
  }

  @Get('families/:familyId/children')
  @ApiOperation({ summary: 'Get all children in a family' })
  @ApiResponse({ status: 200, description: 'Returns list of children' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async findByFamily(@Param('familyId') familyId: string, @Req() req: RequestWithUser) {
    const children = await this.childrenService.findByFamily(familyId, req.user);
    return children.map((child) => ({
      id: child._id,
      familyId: child.familyId,
      fullName: child.fullName,
      dateOfBirth: child.dateOfBirth.toISOString().split('T')[0],
      school: child.school,
      medicalNotes: child.medicalNotes,
    }));
  }

  @Get('children/:id')
  @ApiOperation({ summary: 'Get a specific child by ID' })
  @ApiResponse({ status: 200, description: 'Returns the child' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Child not found' })
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const child = await this.childrenService.findById(id, req.user);
    return {
      id: child._id,
      familyId: child.familyId,
      fullName: child.fullName,
      dateOfBirth: child.dateOfBirth.toISOString().split('T')[0],
      school: child.school,
      medicalNotes: child.medicalNotes,
    };
  }

  @Patch('children/:id')
  @ApiOperation({ summary: 'Update a child profile' })
  @ApiResponse({ status: 200, description: 'Child updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Child not found' })
  async update(
    @Param('id') id: string,
    @Body() updateChildDto: UpdateChildDto,
    @Req() req: RequestWithUser,
  ) {
    const child = await this.childrenService.update(id, updateChildDto, req.user);
    return {
      id: child._id,
      familyId: child.familyId,
      fullName: child.fullName,
      dateOfBirth: child.dateOfBirth.toISOString().split('T')[0],
      school: child.school,
      medicalNotes: child.medicalNotes,
    };
  }

  @Delete('children/:id')
  @ApiOperation({ summary: 'Delete a child profile (soft delete)' })
  @ApiResponse({ status: 200, description: 'Child deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a family member' })
  @ApiResponse({ status: 404, description: 'Child not found' })
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.childrenService.delete(id, req.user);
    return { message: 'Child deleted successfully' };
  }
}
