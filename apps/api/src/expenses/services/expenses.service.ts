import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Expense, ExpenseDocument } from '../../schemas/expense.schema';
import { Family, FamilyDocument } from '../../schemas/family.schema';
import { Parent, ParentDocument } from '../../schemas/parent.schema';
import { Child, ChildDocument } from '../../schemas/child.schema';
import { ExpenseCategory, ExpenseCategoryDocument } from '../../schemas/expense-category.schema';
import { AuthUser } from '../../families/families.service';
import { AuditService } from '../../audit/audit.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { UpdateExpenseStatusDto } from '../dto/update-expense-status.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    @InjectModel(ExpenseCategory.name)
    private expenseCategoryModel: Model<ExpenseCategoryDocument>,
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

  async create(familyId: string, dto: CreateExpenseDto, user: AuthUser): Promise<ExpenseDocument> {
    const family = await this.verifyFamilyAccess(familyId, user);

    // Resolve createdByParentId from user
    const parent = await this.parentModel.findOne({
      auth0Id: user.auth0Id,
      familyId: family._id,
    });
    if (!parent) {
      throw new ForbiddenException('Parent not found');
    }

    // Verify categoryId exists
    const category = await this.expenseCategoryModel.findOne({
      _id: new Types.ObjectId(dto.categoryId),
      familyId: family._id,
      deletedAt: null,
    });
    if (!category) {
      throw new BadRequestException('Invalid expense category ID');
    }

    // Verify childId if provided
    if (dto.childId) {
      const child = await this.childModel.findOne({
        _id: new Types.ObjectId(dto.childId),
        familyId: family._id,
        deletedAt: null,
      });
      if (!child) {
        throw new BadRequestException('Invalid child ID');
      }
    }

    // Determine status
    const status = dto.status || (dto.requiresApproval ? 'pending_approval' : 'approved');

    const expense = new this.expenseModel({
      familyId: family._id,
      childId: dto.childId ? new Types.ObjectId(dto.childId) : null,
      categoryId: new Types.ObjectId(dto.categoryId),
      amount: dto.amount,
      date: new Date(dto.date),
      description: dto.description,
      status,
      requiresApproval: dto.requiresApproval ?? false,
      source: dto.source || 'manual',
      sourceStatementLineId: dto.sourceStatementLineId
        ? new Types.ObjectId(dto.sourceStatementLineId)
        : undefined,
      receiptUrl: dto.receiptUrl,
      createdByParentId: parent._id,
    });

    await expense.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'expense',
      entityId: expense._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: dto as unknown as Record<string, unknown>,
    });

    return expense;
  }

  async findByFamily(familyId: string, user: AuthUser): Promise<ExpenseDocument[]> {
    await this.verifyFamilyAccess(familyId, user);

    return this.expenseModel
      .find({ familyId: new Types.ObjectId(familyId), deletedAt: null })
      .sort({ date: -1 })
      .exec();
  }

  async findById(expenseId: string, user: AuthUser): Promise<ExpenseDocument> {
    const expense = await this.expenseModel.findOne({
      _id: new Types.ObjectId(expenseId),
      deletedAt: null,
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${expenseId} not found`);
    }

    await this.verifyFamilyAccess(expense.familyId.toString(), user);

    return expense;
  }

  private async validateAndApplyCategory(
    expense: ExpenseDocument,
    categoryId: string,
  ): Promise<void> {
    const category = await this.expenseCategoryModel.findOne({
      _id: new Types.ObjectId(categoryId),
      familyId: expense.familyId,
      deletedAt: null,
    });
    if (!category) {
      throw new BadRequestException('Invalid expense category ID');
    }
    expense.categoryId = new Types.ObjectId(categoryId);
  }

  private async validateAndApplyChild(
    expense: ExpenseDocument,
    childId: string | null,
  ): Promise<void> {
    if (childId) {
      const child = await this.childModel.findOne({
        _id: new Types.ObjectId(childId),
        familyId: expense.familyId,
        deletedAt: null,
      });
      if (!child) {
        throw new BadRequestException('Invalid child ID');
      }
      expense.childId = new Types.ObjectId(childId);
    } else {
      expense.childId = null;
    }
  }

  async update(expenseId: string, dto: UpdateExpenseDto, user: AuthUser): Promise<ExpenseDocument> {
    const expense = await this.findById(expenseId, user);

    if (dto.categoryId !== undefined) {
      await this.validateAndApplyCategory(expense, dto.categoryId);
    }
    if (dto.childId !== undefined) {
      await this.validateAndApplyChild(expense, dto.childId ?? null);
    }
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.date !== undefined) expense.date = new Date(dto.date);
    if (dto.description !== undefined) expense.description = dto.description;
    if (dto.status !== undefined) expense.status = dto.status;
    if (dto.requiresApproval !== undefined) expense.requiresApproval = dto.requiresApproval;
    if (dto.source !== undefined) expense.source = dto.source;
    if (dto.sourceStatementLineId !== undefined) {
      expense.sourceStatementLineId = dto.sourceStatementLineId
        ? new Types.ObjectId(dto.sourceStatementLineId)
        : undefined;
    }
    if (dto.receiptUrl !== undefined) expense.receiptUrl = dto.receiptUrl;

    await expense.save();

    await this.auditService.log({
      familyId: expense.familyId,
      entityType: 'expense',
      entityId: expense._id.toString(),
      action: 'update',
      performedBy: user.auth0Id,
      changes: dto as unknown as Record<string, unknown>,
    });

    return expense;
  }

  async delete(expenseId: string, user: AuthUser): Promise<void> {
    const expense = await this.findById(expenseId, user);

    expense.deletedAt = new Date();
    await expense.save();

    await this.auditService.log({
      familyId: expense.familyId,
      entityType: 'expense',
      entityId: expense._id.toString(),
      action: 'delete',
      performedBy: user.auth0Id,
      changes: { deletedAt: expense.deletedAt },
    });
  }

  async updateStatus(
    expenseId: string,
    dto: UpdateExpenseStatusDto,
    user: AuthUser,
  ): Promise<ExpenseDocument> {
    const expense = await this.findById(expenseId, user);

    const oldStatus = expense.status;
    expense.status = dto.status;

    await expense.save();

    await this.auditService.log({
      familyId: expense.familyId,
      entityType: 'expense',
      entityId: expense._id.toString(),
      action: 'update-status',
      performedBy: user.auth0Id,
      changes: { before: { status: oldStatus }, after: { status: dto.status } },
    });

    return expense;
  }
}
