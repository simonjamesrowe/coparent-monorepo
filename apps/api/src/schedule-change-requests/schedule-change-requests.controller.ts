import {
  Controller,
  Get,
  Post,
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
import { ScheduleChangeRequestsService } from './schedule-change-requests.service';
import { CreateScheduleChangeRequestDto } from './dto/create-schedule-change-request.dto';
import { RespondToRequestDto } from './dto/respond-to-request.dto';

@ApiTags('schedule-change-requests')
@ApiBearerAuth()
@Controller('families/:familyId/schedule-change-requests')
@UseGuards(AuthGuard('jwt'))
export class ScheduleChangeRequestsController {
  constructor(private readonly scheduleChangeRequestsService: ScheduleChangeRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new schedule change request' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Family or event not found' })
  async create(
    @Param('familyId') familyId: string,
    @Body() createScheduleChangeRequestDto: CreateScheduleChangeRequestDto,
    @Req() req: any,
  ) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.scheduleChangeRequestsService.create(familyId, createScheduleChangeRequestDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedule change requests for a family' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 200, description: 'Requests retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async findAll(@Param('familyId') familyId: string, @Req() req: any) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.scheduleChangeRequestsService.findByFamily(familyId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific schedule change request by ID' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.scheduleChangeRequestsService.findById(id, user);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a schedule change request' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request approved successfully' })
  @ApiResponse({ status: 400, description: 'Request already resolved or cannot approve own request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async approve(
    @Param('id') id: string,
    @Body() respondToRequestDto: RespondToRequestDto,
    @Req() req: any,
  ) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.scheduleChangeRequestsService.approve(id, respondToRequestDto, user);
  }

  @Post(':id/decline')
  @ApiOperation({ summary: 'Decline a schedule change request' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request declined successfully' })
  @ApiResponse({ status: 400, description: 'Request already resolved or cannot decline own request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async decline(
    @Param('id') id: string,
    @Body() respondToRequestDto: RespondToRequestDto,
    @Req() req: any,
  ) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    return this.scheduleChangeRequestsService.decline(id, respondToRequestDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a schedule change request' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 204, description: 'Request deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied or can only delete own requests' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = {
      auth0Id: req.user.auth0Id,
      email: req.user.email,
    };

    await this.scheduleChangeRequestsService.delete(id, user);
  }
}
