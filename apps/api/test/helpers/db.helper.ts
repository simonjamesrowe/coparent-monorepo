import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Family, FamilyDocument } from '../../src/schemas/family.schema';
import { Parent, ParentDocument } from '../../src/schemas/parent.schema';

interface AddCoParentOptions {
  auth0Id?: string;
  email?: string;
  fullName?: string;
}

export async function addCoParentToFamily(
  app: INestApplication,
  familyId: string,
  options: AddCoParentOptions = {},
): Promise<ParentDocument> {
  const parentModel = app.get<Model<ParentDocument>>(getModelToken(Parent.name));
  const familyModel = app.get<Model<FamilyDocument>>(getModelToken(Family.name));

  const familyObjectId = new Types.ObjectId(familyId);
  const auth0Id = options.auth0Id ?? 'auth0|e2e-coparent';

  const existingParent = await parentModel.findOne({ familyId: familyObjectId, auth0Id });
  if (existingParent) {
    return existingParent;
  }

  const coParent = new parentModel({
    auth0Id,
    familyId: familyObjectId,
    fullName: options.fullName ?? 'E2E Co-Parent',
    email: options.email ?? 'e2e-coparent@coparent.dev',
    role: 'co-parent',
    status: 'active',
    lastSignedInAt: new Date(),
  });
  await coParent.save();

  await familyModel.updateOne({ _id: familyObjectId }, { $addToSet: { parentIds: coParent._id } });

  return coParent;
}
