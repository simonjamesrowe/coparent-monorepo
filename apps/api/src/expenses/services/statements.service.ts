import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Statement, StatementDocument } from '../../schemas/statement.schema';
import { StatementLine, StatementLineDocument } from '../../schemas/statement-line.schema';
import { Family, FamilyDocument } from '../../schemas/family.schema';
import { Parent, ParentDocument } from '../../schemas/parent.schema';
import { Account, AccountDocument } from '../../schemas/account.schema';
import { AuthUser } from '../../families/families.service';
import { AuditService } from '../../audit/audit.service';
import { CreateStatementDto } from '../dto/create-statement.dto';
import { CreateStatementLinesDto } from '../dto/create-statement-lines.dto';
import { UpdateStatementLineDto } from '../dto/update-statement-line.dto';

@Injectable()
export class StatementsService {
  constructor(
    @InjectModel(Statement.name) private statementModel: Model<StatementDocument>,
    @InjectModel(StatementLine.name) private statementLineModel: Model<StatementLineDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @Inject(AuditService) private auditService: AuditService,
  ) {}

  private async verifyFamilyAccess(familyId: string, user: AuthUser): Promise<FamilyDocument> {
    const family = await this.familyModel.findOne({
      _id: new Types.ObjectId(familyId),
      deletedAt: null,
    });

    if (!family) {
      throw new NotFoundException(`Family with ID ${familyId} not found`);
    }

    const parent = await this.parentModel.findOne({
      auth0Id: user.auth0Id,
      familyId: family._id,
    });

    if (!parent) {
      throw new ForbiddenException('You do not have access to this family');
    }

    return family;
  }

  async create(
    familyId: string,
    dto: CreateStatementDto,
    user: AuthUser,
  ): Promise<StatementDocument> {
    const family = await this.verifyFamilyAccess(familyId, user);

    // Verify account belongs to family
    const account = await this.accountModel.findOne({
      _id: new Types.ObjectId(dto.accountId),
      familyId: family._id,
      deletedAt: null,
    });

    if (!account) {
      throw new BadRequestException('Invalid account ID or account does not belong to this family');
    }

    const statement = new this.statementModel({
      familyId: family._id,
      accountId: new Types.ObjectId(dto.accountId),
      fileName: dto.fileName,
      uploadedAt: new Date(),
      periodStart: new Date(dto.periodStart),
      periodEnd: new Date(dto.periodEnd),
      mappingTemplateId: dto.mappingTemplateId
        ? new Types.ObjectId(dto.mappingTemplateId)
        : undefined,
    });

    await statement.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'statement',
      entityId: statement._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: { fileName: statement.fileName },
    });

    return statement;
  }

  async findByFamily(familyId: string, user: AuthUser): Promise<StatementDocument[]> {
    await this.verifyFamilyAccess(familyId, user);

    return this.statementModel
      .find({
        familyId: new Types.ObjectId(familyId),
        deletedAt: null,
      })
      .sort({ uploadedAt: -1 })
      .exec();
  }

  async findById(statementId: string, user: AuthUser): Promise<StatementDocument> {
    const statement = await this.statementModel.findOne({
      _id: new Types.ObjectId(statementId),
      deletedAt: null,
    });

    if (!statement) {
      throw new NotFoundException(`Statement with ID ${statementId} not found`);
    }

    await this.verifyFamilyAccess(statement.familyId.toString(), user);

    return statement;
  }

  async delete(statementId: string, user: AuthUser): Promise<void> {
    const statement = await this.findById(statementId, user);

    // Soft delete statement
    statement.deletedAt = new Date();
    await statement.save();

    // Soft delete all associated lines
    await this.statementLineModel.updateMany(
      { statementId: statement._id, deletedAt: null },
      { deletedAt: new Date() },
    );

    await this.auditService.log({
      familyId: statement.familyId,
      entityType: 'statement',
      entityId: statement._id.toString(),
      action: 'delete',
      performedBy: user.auth0Id,
      changes: { deletedAt: statement.deletedAt },
    });
  }

  async createLines(
    familyId: string,
    statementId: string,
    dto: CreateStatementLinesDto,
    user: AuthUser,
  ): Promise<StatementLineDocument[]> {
    const family = await this.verifyFamilyAccess(familyId, user);

    // Verify statement exists and belongs to family
    const statement = await this.statementModel.findOne({
      _id: new Types.ObjectId(statementId),
      familyId: family._id,
      deletedAt: null,
    });

    if (!statement) {
      throw new NotFoundException('Statement not found or does not belong to this family');
    }

    const lines: StatementLineDocument[] = [];

    for (const lineDto of dto.lines) {
      const line = new this.statementLineModel({
        familyId: family._id,
        statementId: statement._id,
        date: new Date(lineDto.date),
        description: lineDto.description,
        amount: lineDto.amount,
        currency: lineDto.currency ?? 'GBP',
        categoryGuess: lineDto.categoryGuess,
        isChildExpense: lineDto.isChildExpense ?? false,
        requiresApproval: lineDto.requiresApproval ?? false,
      });

      await line.save();
      lines.push(line);
    }

    await this.auditService.log({
      familyId: family._id,
      entityType: 'statement_line',
      entityId: statementId,
      action: 'create',
      performedBy: user.auth0Id,
      changes: { linesCreated: lines.length },
    });

    return lines;
  }

  async findLines(statementId: string, user: AuthUser): Promise<StatementLineDocument[]> {
    const statement = await this.findById(statementId, user);

    return this.statementLineModel
      .find({
        statementId: statement._id,
        deletedAt: null,
      })
      .sort({ date: 1 })
      .exec();
  }

  async updateLine(
    statementId: string,
    lineId: string,
    dto: UpdateStatementLineDto,
    user: AuthUser,
  ): Promise<StatementLineDocument> {
    // Verify statement access
    const statement = await this.findById(statementId, user);

    // Find the line
    const line = await this.statementLineModel.findOne({
      _id: new Types.ObjectId(lineId),
      statementId: statement._id,
      deletedAt: null,
    });

    if (!line) {
      throw new NotFoundException(`Statement line with ID ${lineId} not found`);
    }

    // Update line fields
    if (dto.categoryGuess !== undefined) line.categoryGuess = dto.categoryGuess;
    if (dto.isChildExpense !== undefined) line.isChildExpense = dto.isChildExpense;
    if (dto.requiresApproval !== undefined) line.requiresApproval = dto.requiresApproval;

    await line.save();

    // Note: Auto-creation of expenses is handled separately.
    // When isChildExpense is set to true, the line is marked but linkedExpenseId remains null
    // until an expense is manually created/linked from the UI with proper category assignment.

    await this.auditService.log({
      familyId: statement.familyId,
      entityType: 'statement_line',
      entityId: line._id.toString(),
      action: 'update',
      performedBy: user.auth0Id,
      changes: dto as unknown as Record<string, unknown>,
    });

    return line;
  }
}
