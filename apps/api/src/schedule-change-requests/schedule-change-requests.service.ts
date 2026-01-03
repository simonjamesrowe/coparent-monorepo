import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ScheduleChangeRequest, ScheduleChangeRequestDocument } from '../schemas/schedule-change-request.schema';
import { Event, EventDocument } from '../schemas/event.schema';
import { Family, FamilyDocument } from '../schemas/family.schema';
import { Parent, ParentDocument } from '../schemas/parent.schema';
import { AuthUser } from '../families/families.service';
import { AuditService } from '../audit/audit.service';

import { CreateScheduleChangeRequestDto } from './dto/create-schedule-change-request.dto';
import { RespondToRequestDto } from './dto/respond-to-request.dto';

@Injectable()
export class ScheduleChangeRequestsService {
  constructor(
    @InjectModel(ScheduleChangeRequest.name)
    private scheduleChangeRequestModel: Model<ScheduleChangeRequestDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
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

  private async getParentByUser(familyId: Types.ObjectId, user: AuthUser): Promise<ParentDocument> {
    const parent = await this.parentModel.findOne({
      auth0Id: user.auth0Id,
      familyId: familyId,
    });

    if (!parent) {
      throw new ForbiddenException('You do not have access to this family');
    }

    return parent;
  }

  async create(
    familyId: string,
    createScheduleChangeRequestDto: CreateScheduleChangeRequestDto,
    user: AuthUser,
  ): Promise<ScheduleChangeRequestDocument> {
    const family = await this.verifyFamilyAccess(familyId, user);
    const parent = await this.getParentByUser(family._id, user);

    // Verify original event if provided
    if (createScheduleChangeRequestDto.originalEventId) {
      const event = await this.eventModel.findOne({
        _id: new Types.ObjectId(createScheduleChangeRequestDto.originalEventId),
        familyId: family._id,
        deletedAt: null,
      });

      if (!event) {
        throw new NotFoundException('Original event not found');
      }
    }

    const request = new this.scheduleChangeRequestModel({
      familyId: family._id,
      requestedBy: parent._id,
      requestedAt: new Date(),
      originalEventId: createScheduleChangeRequestDto.originalEventId
        ? new Types.ObjectId(createScheduleChangeRequestDto.originalEventId)
        : null,
      proposedChange: createScheduleChangeRequestDto.proposedChange,
      reason: createScheduleChangeRequestDto.reason,
      status: 'pending',
    });

    await request.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'schedule_change_request',
      entityId: request._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: {
        reason: request.reason,
        proposedChange: request.proposedChange,
      },
    });

    return request;
  }

  async findByFamily(familyId: string, user: AuthUser): Promise<ScheduleChangeRequestDocument[]> {
    await this.verifyFamilyAccess(familyId, user);

    return this.scheduleChangeRequestModel
      .find({
        familyId: new Types.ObjectId(familyId),
        deletedAt: null,
      })
      .sort({ requestedAt: -1 })
      .exec();
  }

  async findById(requestId: string, user: AuthUser): Promise<ScheduleChangeRequestDocument> {
    const request = await this.scheduleChangeRequestModel.findOne({
      _id: new Types.ObjectId(requestId),
      deletedAt: null,
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    await this.verifyFamilyAccess(request.familyId.toString(), user);

    return request;
  }

  async approve(
    requestId: string,
    respondToRequestDto: RespondToRequestDto,
    user: AuthUser,
  ): Promise<ScheduleChangeRequestDocument> {
    const request = await this.findById(requestId, user);

    if (request.status !== 'pending') {
      throw new BadRequestException('Request has already been resolved');
    }

    const parent = await this.getParentByUser(request.familyId, user);

    // Cannot approve your own request
    if (request.requestedBy.toString() === parent._id.toString()) {
      throw new BadRequestException('You cannot approve your own request');
    }

    request.status = 'approved';
    request.resolvedBy = parent._id;
    request.resolvedAt = new Date();
    request.responseNote = respondToRequestDto.responseNote || null;

    await request.save();

    await this.auditService.log({
      familyId: request.familyId,
      entityType: 'schedule_change_request',
      entityId: request._id.toString(),
      action: 'approve',
      performedBy: user.auth0Id,
      changes: {
        status: request.status,
        responseNote: request.responseNote,
      },
    });

    return request;
  }

  async decline(
    requestId: string,
    respondToRequestDto: RespondToRequestDto,
    user: AuthUser,
  ): Promise<ScheduleChangeRequestDocument> {
    const request = await this.findById(requestId, user);

    if (request.status !== 'pending') {
      throw new BadRequestException('Request has already been resolved');
    }

    const parent = await this.getParentByUser(request.familyId, user);

    // Cannot decline your own request
    if (request.requestedBy.toString() === parent._id.toString()) {
      throw new BadRequestException('You cannot decline your own request');
    }

    request.status = 'declined';
    request.resolvedBy = parent._id;
    request.resolvedAt = new Date();
    request.responseNote = respondToRequestDto.responseNote || null;

    await request.save();

    await this.auditService.log({
      familyId: request.familyId,
      entityType: 'schedule_change_request',
      entityId: request._id.toString(),
      action: 'decline',
      performedBy: user.auth0Id,
      changes: {
        status: request.status,
        responseNote: request.responseNote,
      },
    });

    return request;
  }

  async delete(requestId: string, user: AuthUser): Promise<void> {
    const request = await this.findById(requestId, user);
    const parent = await this.getParentByUser(request.familyId, user);

    // Only the requester can delete a request
    if (request.requestedBy.toString() !== parent._id.toString()) {
      throw new ForbiddenException('You can only delete your own requests');
    }

    request.deletedAt = new Date();
    await request.save();

    await this.auditService.log({
      familyId: request.familyId,
      entityType: 'schedule_change_request',
      entityId: request._id.toString(),
      action: 'delete',
      performedBy: user.auth0Id,
      changes: {
        deletedAt: request.deletedAt,
      },
    });
  }
}
