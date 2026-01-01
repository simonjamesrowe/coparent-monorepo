import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Child, ChildSchema } from '../schemas/child.schema';
import { Family, FamilySchema } from '../schemas/family.schema';
import { Parent, ParentSchema } from '../schemas/parent.schema';

import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Child.name, schema: ChildSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Parent.name, schema: ParentSchema },
    ]),
  ],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
