import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { StatementsService } from '../services/statements.service';
import { CreateStatementDto } from '../dto/create-statement.dto';
import { CreateStatementLinesDto } from '../dto/create-statement-lines.dto';
import { UpdateStatementLineDto } from '../dto/update-statement-line.dto';

@ApiTags('statements')
@ApiBearerAuth()
@Controller('families/:familyId/statements')
@UseGuards(AuthGuard('jwt'))
export class StatementsController {
  constructor(@Inject(StatementsService) private readonly statementsService: StatementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new statement' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 201, description: 'Statement created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async create(
    @Param('familyId') familyId: string,
    @Body() dto: CreateStatementDto,
    @Req() req: any,
  ) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.statementsService.create(familyId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all statements for a family' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 200, description: 'Statements retrieved successfully' })
  async findAll(@Param('familyId') familyId: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.statementsService.findByFamily(familyId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a statement by ID' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Statement ID' })
  @ApiResponse({ status: 200, description: 'Statement retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Statement not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.statementsService.findById(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a statement' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Statement ID' })
  @ApiResponse({ status: 204, description: 'Statement deleted successfully' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    await this.statementsService.delete(id, user);
  }

  @Post(':id/lines')
  @ApiOperation({ summary: 'Bulk create statement lines' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Statement ID' })
  @ApiResponse({ status: 201, description: 'Statement lines created successfully' })
  @ApiResponse({ status: 404, description: 'Statement not found' })
  async createLines(
    @Param('familyId') familyId: string,
    @Param('id') statementId: string,
    @Body() dto: CreateStatementLinesDto,
    @Req() req: any,
  ) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.statementsService.createLines(familyId, statementId, dto, user);
  }

  @Get(':id/lines')
  @ApiOperation({ summary: 'Get all lines for a statement' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Statement ID' })
  @ApiResponse({ status: 200, description: 'Statement lines retrieved successfully' })
  async findLines(@Param('id') statementId: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.statementsService.findLines(statementId, user);
  }

  @Patch(':statementId/lines/:lineId')
  @ApiOperation({ summary: 'Update a statement line' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'statementId', description: 'Statement ID' })
  @ApiParam({ name: 'lineId', description: 'Line ID' })
  @ApiResponse({ status: 200, description: 'Statement line updated successfully' })
  @ApiResponse({ status: 404, description: 'Statement or line not found' })
  async updateLine(
    @Param('statementId') statementId: string,
    @Param('lineId') lineId: string,
    @Body() dto: UpdateStatementLineDto,
    @Req() req: any,
  ) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.statementsService.updateLine(statementId, lineId, dto, user);
  }
}
