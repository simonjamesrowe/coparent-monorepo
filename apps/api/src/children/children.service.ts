import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Child, ChildDocument } from '../schemas/child.schema';
import { Family, FamilyDocument } from '../schemas/family.schema';
import { Parent, ParentDocument } from '../schemas/parent.schema';
import { AuthUser } from '../families/families.service';

import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
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
    createChildDto: CreateChildDto,
    user: AuthUser,
  ): Promise<ChildDocument> {
    const family = await this.verifyFamilyAccess(familyId, user);

    const child = new this.childModel({
      familyId: family._id,
      fullName: createChildDto.fullName,
      dateOfBirth: new Date(createChildDto.dateOfBirth),
      school: createChildDto.school,
      medicalNotes: createChildDto.medicalNotes,
    });

    await child.save();

    // Add child to family's childIds
    family.childIds.push(child._id as Types.ObjectId);
    await family.save();

    return child;
  }

  async findByFamily(familyId: string, user: AuthUser): Promise<ChildDocument[]> {
    await this.verifyFamilyAccess(familyId, user);

    return this.childModel
      .find({
        familyId: new Types.ObjectId(familyId),
        deletedAt: null,
      })
      .exec();
  }

  async findById(childId: string, user: AuthUser): Promise<ChildDocument> {
    const child = await this.childModel.findOne({
      _id: new Types.ObjectId(childId),
      deletedAt: null,
    });

    if (!child) {
      throw new NotFoundException(`Child with ID ${childId} not found`);
    }

    // Verify access through family
    await this.verifyFamilyAccess(child.familyId.toString(), user);

    return child;
  }

  async update(
    childId: string,
    updateChildDto: UpdateChildDto,
    user: AuthUser,
  ): Promise<ChildDocument> {
    const child = await this.findById(childId, user);

    if (updateChildDto.fullName !== undefined) {
      child.fullName = updateChildDto.fullName;
    }
    if (updateChildDto.dateOfBirth !== undefined) {
      child.dateOfBirth = new Date(updateChildDto.dateOfBirth);
    }
    if (updateChildDto.school !== undefined) {
      child.school = updateChildDto.school;
    }
    if (updateChildDto.medicalNotes !== undefined) {
      child.medicalNotes = updateChildDto.medicalNotes;
    }

    await child.save();
    return child;
  }

  async delete(childId: string, user: AuthUser): Promise<void> {
    const child = await this.findById(childId, user);

    // Soft delete
    child.deletedAt = new Date();
    await child.save();

    // Remove from family's childIds
    const family = await this.familyModel.findById(child.familyId);
    if (family) {
      family.childIds = family.childIds.filter((id: Types.ObjectId) => id.toString() !== childId);
      await family.save();
    }
  }
}
