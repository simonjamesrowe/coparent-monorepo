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
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CsvMappingTemplatesService } from '../services/csv-mapping-templates.service';
import { CreateCsvMappingTemplateDto } from '../dto/create-csv-mapping-template.dto';
import { UpdateCsvMappingTemplateDto } from '../dto/update-csv-mapping-template.dto';

@ApiTags('csv-mapping-templates')
@ApiBearerAuth()
@Controller('families/:familyId/csv-mapping-templates')
@UseGuards(AuthGuard('jwt'))
export class CsvMappingTemplatesController {
  constructor(
    @Inject(CsvMappingTemplatesService)
    private readonly templatesService: CsvMappingTemplatesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new CSV mapping template' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async create(
    @Param('familyId') familyId: string,
    @Body() dto: CreateCsvMappingTemplateDto,
    @Req() req: any,
  ) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.templatesService.create(familyId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all CSV mapping templates for a family' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findAll(@Param('familyId') familyId: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.templatesService.findByFamily(familyId, user);
  }

  @Get('presets')
  @ApiOperation({ summary: 'Get preset CSV mapping templates' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 200, description: 'Preset templates retrieved successfully' })
  async findPresets() {
    return this.templatesService.findPresets();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a CSV mapping template' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 403, description: 'Cannot update preset templates' })
  async update(@Param('id') id: string, @Body() dto: UpdateCsvMappingTemplateDto, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.templatesService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a CSV mapping template' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 403, description: 'Cannot delete preset templates' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    await this.templatesService.delete(id, user);
  }

  @Post('seed-presets')
  @ApiOperation({ summary: 'Seed preset CSV mapping templates for a family' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 201, description: 'Preset templates seeded successfully' })
  async seedPresets(@Param('familyId') familyId: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.templatesService.seedPresets(familyId, user);
  }
}
