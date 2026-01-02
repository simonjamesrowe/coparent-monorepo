import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Audit, AuditDocument } from '../schemas/audit.schema';

type AuditInput = {
  familyId?: string | Types.ObjectId | null;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  changes?: Record<string, unknown>;
};

@Injectable()
export class AuditService {
  constructor(@InjectModel(Audit.name) private auditModel: Model<AuditDocument>) {}

  async log(entry: AuditInput): Promise<void> {
    const audit = new this.auditModel({
      familyId: entry.familyId ?? null,
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      performedBy: entry.performedBy,
      changes: entry.changes ?? {},
      timestamp: new Date(),
    });

    await audit.save();
  }
}
