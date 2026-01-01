import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { Invitation, InvitationSchema } from '../schemas/invitation.schema';
import { Family, FamilySchema } from '../schemas/family.schema';
import { Parent, ParentSchema } from '../schemas/parent.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invitation.name, schema: InvitationSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Parent.name, schema: ParentSchema },
    ]),
    EmailModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
