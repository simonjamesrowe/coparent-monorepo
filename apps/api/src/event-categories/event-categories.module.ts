import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventCategory, EventCategorySchema } from '../schemas/event-category.schema';
import { Family, FamilySchema } from '../schemas/family.schema';
import { Parent, ParentSchema } from '../schemas/parent.schema';
import { AuditModule } from '../audit/audit.module';

import { EventCategoriesService } from './event-categories.service';
import { EventCategoriesController } from './event-categories.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventCategory.name, schema: EventCategorySchema },
      { name: Family.name, schema: FamilySchema },
      { name: Parent.name, schema: ParentSchema },
    ]),
    AuditModule,
  ],
  controllers: [EventCategoriesController],
  providers: [EventCategoriesService],
  exports: [EventCategoriesService],
})
export class EventCategoriesModule {}
