import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ScheduleChangeRequest, ScheduleChangeRequestSchema } from '../schemas/schedule-change-request.schema';
import { Event, EventSchema } from '../schemas/event.schema';
import { Family, FamilySchema } from '../schemas/family.schema';
import { Parent, ParentSchema } from '../schemas/parent.schema';
import { AuditModule } from '../audit/audit.module';

import { ScheduleChangeRequestsService } from './schedule-change-requests.service';
import { ScheduleChangeRequestsController } from './schedule-change-requests.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduleChangeRequest.name, schema: ScheduleChangeRequestSchema },
      { name: Event.name, schema: EventSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Parent.name, schema: ParentSchema },
    ]),
    AuditModule,
  ],
  controllers: [ScheduleChangeRequestsController],
  providers: [ScheduleChangeRequestsService],
  exports: [ScheduleChangeRequestsService],
})
export class ScheduleChangeRequestsModule {}
