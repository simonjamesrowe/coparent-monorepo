import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { Child, ChildSchema } from '../schemas/child.schema';
import { Family, FamilySchema } from '../schemas/family.schema';
import { Parent, ParentSchema } from '../schemas/parent.schema';

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
