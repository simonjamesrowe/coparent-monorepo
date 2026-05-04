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

import { AccountsService } from '../services/accounts.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('families/:familyId/accounts')
@UseGuards(AuthGuard('jwt'))
export class AccountsController {
  constructor(@Inject(AccountsService) private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async create(
    @Param('familyId') familyId: string,
    @Body() dto: CreateAccountDto,
    @Req() req: any,
  ) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.accountsService.create(familyId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts for a family' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  async findAll(@Param('familyId') familyId: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.accountsService.findByFamily(familyId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by ID' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.accountsService.findById(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateAccountDto, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    return this.accountsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an account' })
  @ApiParam({ name: 'familyId', description: 'Family ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = { auth0Id: req.user.auth0Id, email: req.user.email };
    await this.accountsService.delete(id, user);
  }
}
