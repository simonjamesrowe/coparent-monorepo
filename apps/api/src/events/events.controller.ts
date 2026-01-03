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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('events')
@ApiBearerAuth()
@Controller('families/:familyId/events')
@UseGuards(AuthGuard('jwt'))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Family or category not found' })
  async create(
    @Param('familyId') familyId: string,
    @Body() createEventDto: CreateEventDto,
    @Req() req: any,
  ) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.eventsService.create(familyId, createEventDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events for a family' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async findAll(@Param('familyId') familyId: string, @Req() req: any) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.eventsService.findByFamily(familyId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific event by ID' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.eventsService.findById(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Req() req: any) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.eventsService.update(id, updateEventDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    await this.eventsService.delete(id, user);
  }
}
