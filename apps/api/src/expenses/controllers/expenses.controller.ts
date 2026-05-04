import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { ExpensesService } from '../services/expenses.service';
import { DashboardService } from '../services/dashboard.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { UpdateExpenseStatusDto } from '../dto/update-expense-status.dto';

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('families/:familyId/expenses')
@UseGuards(AuthGuard('jwt'))
export class ExpensesController {
  constructor(
    @Inject(ExpensesService) private readonly expensesService: ExpensesService,
    @Inject(DashboardService) private readonly dashboardService: DashboardService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async create(
    @Param('familyId') familyId: string,
    @Body() dto: CreateExpenseDto,
    @Req() req: any,
  ) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.expensesService.create(familyId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses for a family' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 200, description: 'Expenses retrieved successfully' })
  async findAll(@Param('familyId') familyId: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.expensesService.findByFamily(familyId, user);
  }

  @Get('dashboard-summary')
  @ApiOperation({ summary: 'Get dashboard summary for expenses' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiQuery({ name: 'month', description: 'Month in YYYY-MM format', example: '2026-02' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved successfully' })
  async getDashboardSummary(
    @Param('familyId') familyId: string,
    @Query('month') month: string,
    @Req() req: any,
  ) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.dashboardService.getSummary(familyId, month, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense by ID' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.expensesService.findById(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.expensesService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 204, description: 'Expense deleted successfully' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    await this.expensesService.delete(id, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update expense status' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseStatusDto,
    @Req() req: any,
  ) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.expensesService.updateStatus(id, dto, user);
  }
}
