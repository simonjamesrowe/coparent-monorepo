import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ExpenseCategory, ExpenseCategoryDocument } from '../../schemas/expense-category.schema';
import { Family, FamilyDocument } from '../../schemas/family.schema';
import { Parent, ParentDocument } from '../../schemas/parent.schema';
import { AuthUser } from '../../families/families.service';
import { AuditService } from '../../audit/audit.service';
import { CreateExpenseCategoryDto } from '../dto/create-expense-category.dto';

const PREDEFINED_CATEGORIES = [
  { name: 'School Fees', color: 'lime' },
  { name: 'Medical', color: 'sky' },
  { name: 'Clothing', color: 'amber' },
  { name: 'Activities', color: 'violet' },
  { name: 'Food & Groceries', color: 'rose' },
  { name: 'Transport', color: 'cyan' },
  { name: 'Childcare', color: 'orange' },
  { name: 'Entertainment', color: 'emerald' },
];

@Injectable()
export class ExpenseCategoriesService {
  constructor(
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

  async create(
    familyId: string,
    dto: CreateExpenseCategoryDto,
    user: AuthUser,
  ): Promise<ExpenseCategoryDocument> {
    const family = await this.verifyFamilyAccess(familyId, user);

    const category = new this.expenseCategoryModel({
      familyId: family._id,
      name: dto.name,
      type: dto.type || 'custom',
      color: dto.color,
    });

    await category.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'expense-category',
      entityId: category._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: { name: category.name, type: category.type },
    });

    return category;
  }

  async findByFamily(familyId: string, user: AuthUser): Promise<ExpenseCategoryDocument[]> {
    await this.verifyFamilyAccess(familyId, user);

    return this.expenseCategoryModel
      .find({ familyId: new Types.ObjectId(familyId), deletedAt: null })
      .sort({ type: 1, name: 1 })
      .exec();
  }

  async update(
    categoryId: string,
    dto: CreateExpenseCategoryDto,
    user: AuthUser,
  ): Promise<ExpenseCategoryDocument> {
    const category = await this.expenseCategoryModel.findOne({
      _id: new Types.ObjectId(categoryId),
      deletedAt: null,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    await this.verifyFamilyAccess(category.familyId.toString(), user);

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.color !== undefined) category.color = dto.color;

    await category.save();

    await this.auditService.log({
      familyId: category.familyId,
      entityType: 'expense-category',
      entityId: category._id.toString(),
      action: 'update',
      performedBy: user.auth0Id,
      changes: dto as unknown as Record<string, unknown>,
    });

    return category;
  }

  async delete(categoryId: string, user: AuthUser): Promise<void> {
    const category = await this.expenseCategoryModel.findOne({
      _id: new Types.ObjectId(categoryId),
      deletedAt: null,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    await this.verifyFamilyAccess(category.familyId.toString(), user);

    category.deletedAt = new Date();
    await category.save();

    await this.auditService.log({
      familyId: category.familyId,
      entityType: 'expense-category',
      entityId: category._id.toString(),
      action: 'delete',
      performedBy: user.auth0Id,
      changes: { deletedAt: category.deletedAt },
    });
  }

  async seed(familyId: string, user: AuthUser): Promise<ExpenseCategoryDocument[]> {
    const family = await this.verifyFamilyAccess(familyId, user);

    const existing = await this.expenseCategoryModel.find({
      familyId: family._id,
      type: 'predefined',
      deletedAt: null,
    });

    if (existing.length > 0) {
      return existing;
    }

    const categories = await this.expenseCategoryModel.insertMany(
      PREDEFINED_CATEGORIES.map((cat) => ({
        familyId: family._id,
        name: cat.name,
        type: 'predefined',
        color: cat.color,
      })),
    );

    await this.auditService.log({
      familyId: family._id,
      entityType: 'expense-category',
      entityId: 'seed',
      action: 'seed',
      performedBy: user.auth0Id,
      changes: { count: categories.length },
    });

    return categories;
  }
}
