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

import { ExpenseCategoriesService } from '../services/expense-categories.service';
import { CreateExpenseCategoryDto } from '../dto/create-expense-category.dto';

@ApiTags('expense-categories')
@ApiBearerAuth()
@Controller('families/:familyId/expense-categories')
@UseGuards(AuthGuard('jwt'))
export class ExpenseCategoriesController {
  constructor(
    @Inject(ExpenseCategoriesService)
    private readonly categoriesService: ExpenseCategoriesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense category' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async create(
    @Param('familyId') familyId: string,
    @Body() dto: CreateExpenseCategoryDto,
    @Req() req: any,
  ) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.categoriesService.create(familyId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expense categories for a family' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async findAll(@Param('familyId') familyId: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.categoriesService.findByFamily(familyId, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense category' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async update(@Param('id') id: string, @Body() dto: CreateExpenseCategoryDto, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.categoriesService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense category' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    await this.categoriesService.delete(id, user);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed predefined expense categories' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 201, description: 'Categories seeded successfully' })
  async seed(@Param('familyId') familyId: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.categoriesService.seed(familyId, user);
  }
}
