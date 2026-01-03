import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EventCategoriesService } from './event-categories.service';
import { CreateEventCategoryDto } from './dto/create-event-category.dto';
import { UpdateEventCategoryDto } from './dto/update-event-category.dto';

@ApiTags('event-categories')
@ApiBearerAuth()
@Controller('families/:familyId/event-categories')
@UseGuards(AuthGuard('jwt'))
export class EventCategoriesController {
  constructor(private readonly eventCategoriesService: EventCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event category' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async create(
    @Param('familyId') familyId: string,
    @Body() createEventCategoryDto: CreateEventCategoryDto,
    @Req() req: any,
  ) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.eventCategoriesService.create(familyId, createEventCategoryDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all event categories for a family' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async findAll(@Param('familyId') familyId: string, @Req() req: any) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.eventCategoriesService.findByFamily(familyId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific event category by ID' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.eventCategoriesService.findById(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an event category' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or cannot modify system category' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id') id: string,
    @Body() updateEventCategoryDto: UpdateEventCategoryDto,
    @Req() req: any,
  ) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.eventCategoriesService.update(id, updateEventCategoryDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event category' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete system category' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    await this.eventCategoriesService.delete(id, user);
  }
}
