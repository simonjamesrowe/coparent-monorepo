import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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

import { BudgetsService } from '../services/budgets.service';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';

@ApiTags('budgets')
@ApiBearerAuth()
@Controller('families/:familyId/budgets')
@UseGuards(AuthGuard('jwt'))
export class BudgetsController {
  constructor(@Inject(BudgetsService) private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async create(@Param('familyId') familyId: string, @Body() dto: CreateBudgetDto, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.budgetsService.create(familyId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets for a family' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiQuery({ name: 'month', description: 'Filter by month (YYYY-MM)', required: false })
  @ApiResponse({ status: 200, description: 'Budgets retrieved successfully' })
  async findAll(
    @Param('familyId') familyId: string,
    @Query('month') month: string | undefined,
    @Req() req: any,
  ) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.budgetsService.findByFamily(familyId, user, month);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateBudgetDto, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.budgetsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 204, description: 'Budget deleted successfully' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    await this.budgetsService.delete(id, user);
  }
}
