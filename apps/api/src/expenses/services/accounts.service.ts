import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Account, AccountDocument } from '../../schemas/account.schema';
import { Family, FamilyDocument } from '../../schemas/family.schema';
import { Parent, ParentDocument } from '../../schemas/parent.schema';
import { AuthUser } from '../../families/families.service';
import { AuditService } from '../../audit/audit.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
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

  async create(familyId: string, dto: CreateAccountDto, user: AuthUser): Promise<AccountDocument> {
    const family = await this.verifyFamilyAccess(familyId, user);

    const ownerParent = await this.parentModel.findOne({
      _id: new Types.ObjectId(dto.ownerParentId),
      familyId: family._id,
    });

    if (!ownerParent) {
      throw new BadRequestException('Invalid owner parent ID');
    }

    const account = new this.accountModel({
      familyId: family._id,
      type: dto.type,
      bankName: dto.bankName,
      accountName: dto.accountName,
      last4: dto.last4,
      ownerParentId: new Types.ObjectId(dto.ownerParentId),
      accountSubtype: dto.accountSubtype,
      cardType: dto.cardType,
    });

    await account.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'account',
      entityId: account._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: { type: account.type, bankName: account.bankName },
    });

    return account;
  }

  async findByFamily(familyId: string, user: AuthUser): Promise<AccountDocument[]> {
    await this.verifyFamilyAccess(familyId, user);

    return this.accountModel
      .find({ familyId: new Types.ObjectId(familyId), deletedAt: null })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(accountId: string, user: AuthUser): Promise<AccountDocument> {
    const account = await this.accountModel.findOne({
      _id: new Types.ObjectId(accountId),
      deletedAt: null,
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    await this.verifyFamilyAccess(account.familyId.toString(), user);

    return account;
  }

  async update(accountId: string, dto: UpdateAccountDto, user: AuthUser): Promise<AccountDocument> {
    const account = await this.findById(accountId, user);

    if (dto.type !== undefined) account.type = dto.type;
    if (dto.bankName !== undefined) account.bankName = dto.bankName;
    if (dto.accountName !== undefined) account.accountName = dto.accountName;
    if (dto.last4 !== undefined) account.last4 = dto.last4;
    if (dto.ownerParentId !== undefined) {
      account.ownerParentId = new Types.ObjectId(dto.ownerParentId);
    }
    if (dto.accountSubtype !== undefined) account.accountSubtype = dto.accountSubtype;
    if (dto.cardType !== undefined) account.cardType = dto.cardType;

    await account.save();

    await this.auditService.log({
      familyId: account.familyId,
      entityType: 'account',
      entityId: account._id.toString(),
      action: 'update',
      performedBy: user.auth0Id,
      changes: dto as unknown as Record<string, unknown>,
    });

    return account;
  }

  async delete(accountId: string, user: AuthUser): Promise<void> {
    const account = await this.findById(accountId, user);

    account.deletedAt = new Date();
    await account.save();

    await this.auditService.log({
      familyId: account.familyId,
      entityType: 'account',
      entityId: account._id.toString(),
      action: 'delete',
      performedBy: user.auth0Id,
      changes: { deletedAt: account.deletedAt },
    });
  }
}
