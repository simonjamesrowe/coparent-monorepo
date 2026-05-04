import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Expense, ExpenseDocument } from '../../schemas/expense.schema';
import { Budget, BudgetDocument } from '../../schemas/budget.schema';
import { Family, FamilyDocument } from '../../schemas/family.schema';
import { Parent, ParentDocument } from '../../schemas/parent.schema';
import { AuthUser } from '../../families/families.service';
import { AuditService } from '../../audit/audit.service';

export interface DashboardSummary {
  month: string;
  totalSpent: number;
  totalChildExpenses: number;
  reimbursementsDue: number;
  categoryBreakdown: {
    categoryId: string;
    spent: number;
    budgetLimit?: number | null;
  }[];
  accountSpend: [];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
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

  async getSummary(familyId: string, month: string, user: AuthUser): Promise<DashboardSummary> {
    const family = await this.verifyFamilyAccess(familyId, user);

    // Parse month string to get date range
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Calculate totals
    const [totals] = await this.expenseModel.aggregate([
      {
        $match: {
          familyId: new Types.ObjectId(familyId),
          date: { $gte: startDate, $lt: endDate },
          status: { $in: ['approved', 'reimbursed'] },
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          totalChildExpenses: {
            $sum: { $cond: [{ $ne: ['$childId', null] }, '$amount', 0] },
          },
          reimbursementsDue: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ['$status', 'approved'] }, { $eq: ['$requiresApproval', true] }],
                },
                '$amount',
                0,
              ],
            },
          },
        },
      },
    ]);

    // Calculate category breakdown
    const categoryBreakdown = await this.expenseModel.aggregate([
      {
        $match: {
          familyId: new Types.ObjectId(familyId),
          date: { $gte: startDate, $lt: endDate },
          status: { $in: ['approved', 'reimbursed'] },
          deletedAt: null,
        },
      },
      { $group: { _id: '$categoryId', spent: { $sum: '$amount' } } },
    ]);

    // Fetch budgets for this month
    const budgets = await this.budgetModel
      .find({
        familyId: new Types.ObjectId(familyId),
        month,
        deletedAt: null,
      })
      .exec();

    // Create budget map
    const budgetMap = new Map<string, number>();
    for (const budget of budgets) {
      budgetMap.set(budget.categoryId.toString(), budget.limit);
    }

    // Enrich category breakdown with budget limits
    const enrichedCategoryBreakdown = categoryBreakdown.map((item) => ({
      categoryId: item._id.toString(),
      spent: item.spent,
      budgetLimit: budgetMap.get(item._id.toString()) ?? null,
    }));

    await this.auditService.log({
      familyId: family._id,
      entityType: 'dashboard',
      entityId: familyId,
      action: 'view-summary',
      performedBy: user.auth0Id,
      changes: { month },
    });

    return {
      month,
      totalSpent: totals?.totalSpent || 0,
      totalChildExpenses: totals?.totalChildExpenses || 0,
      reimbursementsDue: totals?.reimbursementsDue || 0,
      categoryBreakdown: enrichedCategoryBreakdown,
      accountSpend: [],
    };
  }
}
