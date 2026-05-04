import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  CsvMappingTemplate,
  CsvMappingTemplateDocument,
} from '../../schemas/csv-mapping-template.schema';
import { Family, FamilyDocument } from '../../schemas/family.schema';
import { Parent, ParentDocument } from '../../schemas/parent.schema';
import { Account, AccountDocument } from '../../schemas/account.schema';
import { AuthUser } from '../../families/families.service';
import { AuditService } from '../../audit/audit.service';
import { CreateCsvMappingTemplateDto } from '../dto/create-csv-mapping-template.dto';
import { UpdateCsvMappingTemplateDto } from '../dto/update-csv-mapping-template.dto';

@Injectable()
export class CsvMappingTemplatesService {
  constructor(
    @InjectModel(CsvMappingTemplate.name) private templateModel: Model<CsvMappingTemplateDocument>,
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
    dto: CreateCsvMappingTemplateDto,
    user: AuthUser,
  ): Promise<CsvMappingTemplateDocument> {
    const family = await this.verifyFamilyAccess(familyId, user);

    // Verify account if provided
    if (dto.accountId) {
      const account = await this.accountModel.findOne({
        _id: new Types.ObjectId(dto.accountId),
        familyId: family._id,
        deletedAt: null,
      });

      if (!account) {
        throw new BadRequestException('Invalid account ID');
      }
    }

    const template = new this.templateModel({
      familyId: family._id,
      accountId: dto.accountId ? new Types.ObjectId(dto.accountId) : undefined,
      name: dto.name,
      mappings: dto.mappings,
      delimiter: dto.delimiter ?? ',',
      hasHeaderRow: dto.hasHeaderRow ?? true,
      isPreset: false,
    });

    await template.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'csv_mapping_template',
      entityId: template._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: { name: template.name },
    });

    return template;
  }

  async findByFamily(familyId: string, user: AuthUser): Promise<CsvMappingTemplateDocument[]> {
    await this.verifyFamilyAccess(familyId, user);

    return this.templateModel
      .find({
        familyId: new Types.ObjectId(familyId),
        isPreset: false,
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPresets(): Promise<CsvMappingTemplateDocument[]> {
    try {
      return await this.templateModel
        .find({
          isPreset: true,
          deletedAt: null,
        })
        .sort({ name: 1 })
        .exec();
    } catch {
      return [];
    }
  }

  async findById(templateId: string, user: AuthUser): Promise<CsvMappingTemplateDocument> {
    const template = await this.templateModel.findOne({
      _id: new Types.ObjectId(templateId),
      deletedAt: null,
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    // Presets are globally accessible, non-presets require family access
    if (!template.isPreset) {
      await this.verifyFamilyAccess(template.familyId.toString(), user);
    }

    return template;
  }

  async update(
    templateId: string,
    dto: UpdateCsvMappingTemplateDto,
    user: AuthUser,
  ): Promise<CsvMappingTemplateDocument> {
    const template = await this.findById(templateId, user);

    // Cannot update preset templates
    if (template.isPreset) {
      throw new ForbiddenException('Cannot update preset templates');
    }

    // Verify account if provided
    if (dto.accountId !== undefined) {
      if (dto.accountId) {
        const account = await this.accountModel.findOne({
          _id: new Types.ObjectId(dto.accountId),
          familyId: template.familyId,
          deletedAt: null,
        });

        if (!account) {
          throw new BadRequestException('Invalid account ID');
        }
        template.accountId = new Types.ObjectId(dto.accountId);
      } else {
        template.accountId = undefined;
      }
    }

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.mappings !== undefined) template.mappings = dto.mappings;
    if (dto.delimiter !== undefined) template.delimiter = dto.delimiter;
    if (dto.hasHeaderRow !== undefined) template.hasHeaderRow = dto.hasHeaderRow;

    await template.save();

    await this.auditService.log({
      familyId: template.familyId,
      entityType: 'csv_mapping_template',
      entityId: template._id.toString(),
      action: 'update',
      performedBy: user.auth0Id,
      changes: dto as unknown as Record<string, unknown>,
    });

    return template;
  }

  async delete(templateId: string, user: AuthUser): Promise<void> {
    const template = await this.findById(templateId, user);

    // Cannot delete preset templates
    if (template.isPreset) {
      throw new ForbiddenException('Cannot delete preset templates');
    }

    template.deletedAt = new Date();
    await template.save();

    await this.auditService.log({
      familyId: template.familyId,
      entityType: 'csv_mapping_template',
      entityId: template._id.toString(),
      action: 'delete',
      performedBy: user.auth0Id,
      changes: { deletedAt: template.deletedAt },
    });
  }

  async seedPresets(familyId: string, user: AuthUser): Promise<CsvMappingTemplateDocument[]> {
    await this.verifyFamilyAccess(familyId, user);

    const presets = [
      {
        name: 'Santander CC',
        mappings: {
          dateColumn: 'Date',
          descriptionColumn: 'Description',
          amountColumn: 'Amount',
          categoryColumn: 'Category',
        },
        delimiter: ',',
        hasHeaderRow: true,
        bankNameMatch: 'Santander',
        accountTypeMatch: 'credit-card',
      },
      {
        name: 'Santander Savings (Midata)',
        mappings: {
          dateColumn: 'Date',
          descriptionColumn: 'Description',
          amountColumn: 'Money in',
          categoryColumn: '',
        },
        delimiter: ',',
        hasHeaderRow: true,
        bankNameMatch: 'Santander',
        accountTypeMatch: 'bank-account',
      },
      {
        name: 'Amex CC',
        mappings: {
          dateColumn: 'Date',
          descriptionColumn: 'Description',
          amountColumn: 'Amount',
          categoryColumn: '',
        },
        delimiter: ',',
        hasHeaderRow: true,
        bankNameMatch: 'Amex',
        accountTypeMatch: 'credit-card',
      },
      {
        name: 'Starling',
        mappings: {
          dateColumn: 'Date',
          descriptionColumn: 'Reference',
          amountColumn: 'Amount (GBP)',
          categoryColumn: 'Spending Category',
        },
        delimiter: ',',
        hasHeaderRow: true,
        bankNameMatch: 'Starling',
      },
      {
        name: 'Monzo',
        mappings: {
          dateColumn: 'Date',
          descriptionColumn: 'Name',
          amountColumn: 'Amount',
          categoryColumn: 'Category',
        },
        delimiter: ',',
        hasHeaderRow: true,
        bankNameMatch: 'Monzo',
      },
    ];

    const createdPresets: CsvMappingTemplateDocument[] = [];

    for (const preset of presets) {
      const template = new this.templateModel({
        familyId: new Types.ObjectId(familyId),
        isPreset: true,
        ...preset,
      });

      await template.save();
      createdPresets.push(template);
    }

    await this.auditService.log({
      familyId: new Types.ObjectId(familyId),
      entityType: 'csv_mapping_template',
      entityId: 'bulk',
      action: 'create',
      performedBy: user.auth0Id,
      changes: { presets: createdPresets.length },
    });

    return createdPresets;
  }
}
