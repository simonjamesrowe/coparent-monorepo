import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Parent, ParentSchema } from '../schemas/parent.schema';
import { AuditModule } from '../audit/audit.module';

import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Parent.name, schema: ParentSchema }]), AuditModule],
  controllers: [ParentsController],
  providers: [ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}
