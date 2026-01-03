import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Event, EventDocument } from '../schemas/event.schema';
import { Family, FamilyDocument } from '../schemas/family.schema';
import { Parent, ParentDocument } from '../schemas/parent.schema';
import { Child, ChildDocument } from '../schemas/child.schema';
import { AuthUser } from '../families/families.service';
import { AuditService } from '../audit/audit.service';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
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
    createEventDto: CreateEventDto,
    user: AuthUser,
  ): Promise<EventDocument> {
    const family = await this.verifyFamilyAccess(familyId, user);

    // Verify child IDs if provided
    if (createEventDto.childIds && createEventDto.childIds.length > 0) {
      const children = await this.childModel.find({
        _id: { $in: createEventDto.childIds.map((id) => new Types.ObjectId(id)) },
        familyId: family._id,
        deletedAt: null,
      });

      if (children.length !== createEventDto.childIds.length) {
        throw new BadRequestException('One or more child IDs are invalid');
      }
    }

    // Verify parent ID if provided
    if (createEventDto.parentId) {
      const parent = await this.parentModel.findOne({
        _id: new Types.ObjectId(createEventDto.parentId),
        familyId: family._id,
      });

      if (!parent) {
        throw new BadRequestException('Invalid parent ID');
      }
    }

    if (createEventDto.parentIds && createEventDto.parentIds.length > 0) {
      const parents = await this.parentModel.find({
        _id: { $in: createEventDto.parentIds.map((id) => new Types.ObjectId(id)) },
        familyId: family._id,
      });

      if (parents.length !== createEventDto.parentIds.length) {
        throw new BadRequestException('One or more parent IDs are invalid');
      }
    }

    const event = new this.eventModel({
      familyId: family._id,
      type: createEventDto.type,
      title: createEventDto.title,
      startDate: new Date(createEventDto.startDate),
      endDate: createEventDto.endDate ? new Date(createEventDto.endDate) : undefined,
      startTime: createEventDto.startTime,
      endTime: createEventDto.endTime,
      allDay: createEventDto.allDay,
      parentId: createEventDto.parentId ? new Types.ObjectId(createEventDto.parentId) : null,
      parentIds: createEventDto.parentIds
        ? createEventDto.parentIds.map((id) => new Types.ObjectId(id))
        : [],
      childIds: createEventDto.childIds.map((id) => new Types.ObjectId(id)),
      location: createEventDto.location,
      notes: createEventDto.notes || null,
      recurring: createEventDto.recurring || null,
    });

    await event.save();

    await this.auditService.log({
      familyId: family._id,
      entityType: 'event',
      entityId: event._id.toString(),
      action: 'create',
      performedBy: user.auth0Id,
      changes: {
        type: event.type,
        title: event.title,
        startDate: event.startDate,
      },
    });

    return event;
  }

  async findByFamily(familyId: string, user: AuthUser): Promise<EventDocument[]> {
    await this.verifyFamilyAccess(familyId, user);

    return this.eventModel
      .find({
        familyId: new Types.ObjectId(familyId),
        deletedAt: null,
      })
      .sort({ startDate: 1 })
      .exec();
  }

  async findById(eventId: string, user: AuthUser): Promise<EventDocument> {
    const event = await this.eventModel.findOne({
      _id: new Types.ObjectId(eventId),
      deletedAt: null,
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    await this.verifyFamilyAccess(event.familyId.toString(), user);

    return event;
  }

  async update(
    eventId: string,
    updateEventDto: UpdateEventDto,
    user: AuthUser,
  ): Promise<EventDocument> {
    const event = await this.findById(eventId, user);
    this.applyEventUpdates(event, updateEventDto);

    await event.save();

    await this.auditService.log({
      familyId: event.familyId,
      entityType: 'event',
      entityId: event._id.toString(),
      action: 'update',
      performedBy: user.auth0Id,
      changes: updateEventDto as Record<string, unknown>,
    });

    return event;
  }

  private applyEventUpdates(event: EventDocument, updateEventDto: UpdateEventDto): void {
    const setIfDefined = <K extends keyof UpdateEventDto>(
      key: K,
      apply: (value: NonNullable<UpdateEventDto[K]>) => void,
    ) => {
      const value = updateEventDto[key];
      if (value !== undefined) {
        apply(value as NonNullable<UpdateEventDto[K]>);
      }
    };

    setIfDefined('type', (value) => {
      event.type = value;
    });
    setIfDefined('title', (value) => {
      event.title = value;
    });
    setIfDefined('startDate', (value) => {
      event.startDate = new Date(value);
    });
    setIfDefined('endDate', (value) => {
      event.endDate = new Date(value);
    });
    setIfDefined('startTime', (value) => {
      event.startTime = value;
    });
    setIfDefined('endTime', (value) => {
      event.endTime = value;
    });
    setIfDefined('allDay', (value) => {
      event.allDay = value;
    });
    setIfDefined('parentId', (value) => {
      event.parentId = value ? new Types.ObjectId(value) : null;
    });
    setIfDefined('parentIds', (value) => {
      event.parentIds = value ? value.map((id) => new Types.ObjectId(id)) : [];
    });
    setIfDefined('childIds', (value) => {
      event.childIds = value.map((id) => new Types.ObjectId(id));
    });
    setIfDefined('location', (value) => {
      event.location = value;
    });
    setIfDefined('notes', (value) => {
      event.notes = value || null;
    });
    setIfDefined('recurring', (value) => {
      event.recurring = value || null;
    });
  }

  async delete(eventId: string, user: AuthUser): Promise<void> {
    const event = await this.findById(eventId, user);

    event.deletedAt = new Date();
    await event.save();

    await this.auditService.log({
      familyId: event.familyId,
      entityType: 'event',
      entityId: event._id.toString(),
      action: 'delete',
      performedBy: user.auth0Id,
      changes: {
        deletedAt: event.deletedAt,
      },
    });
  }
}
