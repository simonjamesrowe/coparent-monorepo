import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Budget, BudgetDocument } from '../../schemas/budget.schema';
import { Expense, ExpenseDocument } from '../../schemas/expense.schema';
import { ExpenseCategory, ExpenseCategoryDocument } from '../../schemas/expense-category.schema';
import { Family, FamilyDocument } from '../../schemas/family.schema';
import { Parent, ParentDocument } from '../../schemas/parent.schema';
import { AuthUser } from '../../families/families.service';
import { AuditService } from '../../audit/audit.service';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';

export interface EnrichedBudget {
  _id: Types.ObjectId;
  familyId: Types.ObjectId;
  categoryId: Types.ObjectId;
  month: string;
  limit: number;
  spent: number;
  status: 'on_track' | 'near_limit' | 'over';
}

@Injectable()
export class BudgetsService {
  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(ExpenseCategory.name)
    private expenseCategoryModel: Model<ExpenseCategoryDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
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

  async create(familyId: string, dto: CreateBudgetDto, user: AuthUser): Promise<BudgetDocument> {
    const family = await this.verifyFamilyAccess(familyId, user);

    // Verify categoryId exists
    const category = await this.expenseCategoryModel.findOne({
      _id: new Types.ObjectId(dto.categoryId),
      familyId: family._id,
      deletedAt: null,
    });
    if (!category) {
      throw new BadRequestException('Invalid expense category ID');
    }

    const budget = new this.budgetModel({
      familyId: family._id,
      categoryId: new Types.ObjectId(dto.categoryId),
      month: dto.month,
      limit: dto.limit,
    });

    await budget.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'budget',
      entityId: budget._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: dto as unknown as Record<string, unknown>,
    });

    return budget;
  }

  async findByFamily(familyId: string, user: AuthUser, month?: string): Promise<EnrichedBudget[]> {
    await this.verifyFamilyAccess(familyId, user);

    const query: any = { familyId: new Types.ObjectId(familyId), deletedAt: null };
    if (month) {
      query.month = month;
    }

    const budgets = await this.budgetModel.find(query).exec();

    // Calculate spent amounts using aggregation
    const spentAgg = await this.expenseModel.aggregate([
      {
        $match: {
          familyId: new Types.ObjectId(familyId),
          status: { $in: ['approved', 'reimbursed'] },
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: {
            categoryId: '$categoryId',
            month: { $dateToString: { format: '%Y-%m', date: '$date' } },
          },
          spent: { $sum: '$amount' },
        },
      },
    ]);

    // Create a map for quick lookup
    const spentMap = new Map<string, number>();
    for (const item of spentAgg) {
      const key = `${item._id.categoryId.toString()}-${item._id.month}`;
      spentMap.set(key, item.spent);
    }

    // Enrich budgets with spent and status
    const enrichedBudgets: EnrichedBudget[] = budgets.map((budget) => {
      const key = `${budget.categoryId.toString()}-${budget.month}`;
      const spent = spentMap.get(key) || 0;
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      let status: 'on_track' | 'near_limit' | 'over';
      if (percentage > 100) {
        status = 'over';
      } else if (percentage >= 80) {
        status = 'near_limit';
      } else {
        status = 'on_track';
      }

      return {
        _id: budget._id,
        familyId: budget.familyId,
        categoryId: budget.categoryId,
        month: budget.month,
        limit: budget.limit,
        spent,
        status,
      };
    });

    return enrichedBudgets;
  }

  async update(budgetId: string, dto: UpdateBudgetDto, user: AuthUser): Promise<BudgetDocument> {
    const budget = await this.budgetModel.findOne({
      _id: new Types.ObjectId(budgetId),
      deletedAt: null,
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }

    await this.verifyFamilyAccess(budget.familyId.toString(), user);

    if (dto.categoryId !== undefined) {
      const category = await this.expenseCategoryModel.findOne({
        _id: new Types.ObjectId(dto.categoryId),
        familyId: budget.familyId,
        deletedAt: null,
      });
      if (!category) {
        throw new BadRequestException('Invalid expense category ID');
      }
      budget.categoryId = new Types.ObjectId(dto.categoryId);
    }

    if (dto.month !== undefined) budget.month = dto.month;
    if (dto.limit !== undefined) budget.limit = dto.limit;

    await budget.save();

    await this.auditService.log({
      familyId: budget.familyId,
      entityType: 'budget',
      entityId: budget._id.toString(),
      action: 'update',
      performedBy: user.auth0Id,
      changes: dto as unknown as Record<string, unknown>,
    });

    return budget;
  }

  async delete(budgetId: string, user: AuthUser): Promise<void> {
    const budget = await this.budgetModel.findOne({
      _id: new Types.ObjectId(budgetId),
      deletedAt: null,
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }

    await this.verifyFamilyAccess(budget.familyId.toString(), user);

    budget.deletedAt = new Date();
    await budget.save();

    await this.auditService.log({
      familyId: budget.familyId,
      entityType: 'budget',
      entityId: budget._id.toString(),
      action: 'delete',
      performedBy: user.auth0Id,
      changes: { deletedAt: budget.deletedAt },
    });
  }
}
