import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { EventCategory, EventCategoryDocument } from '../schemas/event-category.schema';
import { Family, FamilyDocument } from '../schemas/family.schema';
import { Parent, ParentDocument } from '../schemas/parent.schema';
import { AuthUser } from '../families/families.service';
import { AuditService } from '../audit/audit.service';

import { CreateEventCategoryDto } from './dto/create-event-category.dto';
import { UpdateEventCategoryDto } from './dto/update-event-category.dto';

@Injectable()
export class EventCategoriesService {
  constructor(
    @InjectModel(EventCategory.name) private eventCategoryModel: Model<EventCategoryDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
    private auditService: AuditService,
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
    createEventCategoryDto: CreateEventCategoryDto,
    user: AuthUser,
  ): Promise<EventCategoryDocument> {
    const family = await this.verifyFamilyAccess(familyId, user);

    const category = new this.eventCategoryModel({
      familyId: family._id,
      name: createEventCategoryDto.name,
      icon: createEventCategoryDto.icon,
      color: createEventCategoryDto.color,
      isDefault: createEventCategoryDto.isDefault || false,
      isSystem: createEventCategoryDto.isSystem || false,
    });

    await category.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'event_category',
      entityId: category._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: {
        name: category.name,
        icon: category.icon,
        color: category.color,
      },
    });

    return category;
  }

  async findByFamily(familyId: string, user: AuthUser): Promise<EventCategoryDocument[]> {
    await this.verifyFamilyAccess(familyId, user);

    return this.eventCategoryModel
      .find({
        familyId: new Types.ObjectId(familyId),
        deletedAt: null,
      })
      .sort({ isSystem: -1, isDefault: -1, name: 1 })
      .exec();
  }

  async findById(categoryId: string, user: AuthUser): Promise<EventCategoryDocument> {
    const category = await this.eventCategoryModel.findOne({
      _id: new Types.ObjectId(categoryId),
      deletedAt: null,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    await this.verifyFamilyAccess(category.familyId.toString(), user);

    return category;
  }

  async update(
    categoryId: string,
    updateEventCategoryDto: UpdateEventCategoryDto,
    user: AuthUser,
  ): Promise<EventCategoryDocument> {
    const category = await this.findById(categoryId, user);

    if (category.isSystem) {
      throw new BadRequestException('Cannot modify system categories');
    }

    if (updateEventCategoryDto.name !== undefined) {
      category.name = updateEventCategoryDto.name;
    }
    if (updateEventCategoryDto.icon !== undefined) {
      category.icon = updateEventCategoryDto.icon;
    }
    if (updateEventCategoryDto.color !== undefined) {
      category.color = updateEventCategoryDto.color;
    }
    if (updateEventCategoryDto.isDefault !== undefined) {
      category.isDefault = updateEventCategoryDto.isDefault;
    }

    await category.save();

    await this.auditService.log({
      familyId: category.familyId,
      entityType: 'event_category',
      entityId: category._id.toString(),
      action: 'update',
      performedBy: user.auth0Id,
      changes: updateEventCategoryDto as Record<string, unknown>,
    });

    return category;
  }

  async delete(categoryId: string, user: AuthUser): Promise<void> {
    const category = await this.findById(categoryId, user);

    if (category.isSystem) {
      throw new BadRequestException('Cannot delete system categories');
    }

    category.deletedAt = new Date();
    await category.save();

    await this.auditService.log({
      familyId: category.familyId,
      entityType: 'event_category',
      entityId: category._id.toString(),
      action: 'delete',
      performedBy: user.auth0Id,
      changes: {
        deletedAt: category.deletedAt,
      },
    });
  }
}
