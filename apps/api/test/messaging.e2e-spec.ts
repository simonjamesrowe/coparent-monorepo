import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/test-utils';
import { clearTokenCache, getTestToken, getTestTokenForUser } from './helpers/auth.helper';
import { addCoParentToFamily } from './helpers/db.helper';

describe('Messaging (e2e)', () => {
  let app: INestApplication;
  let primaryToken: string;
  let coParentToken: string;
  let familyId: string;
  let childId: string;
  let coParentId: string;

  beforeAll(async () => {
    app = await createTestApp();
    primaryToken = await getTestToken();

    const familyResponse = await request(app.getHttpServer())
      .post('/families')
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        name: 'Messaging Test Family',
        timeZone: 'America/New_York',
      })
      .expect(201);

    familyId = familyResponse.body.id;

    const childResponse = await request(app.getHttpServer())
      .post(`/families/${familyId}/children`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        fullName: 'Messaging Child',
        dateOfBirth: '2017-09-18',
      })
      .expect(201);

    childId = childResponse.body.id;

    const coParent = await addCoParentToFamily(app, familyId, {
      auth0Id: 'auth0|messaging-co-parent',
      email: 'messaging-coparent@coparent.dev',
      fullName: 'Messaging CoParent',
    });

    coParentId = coParent._id.toString();
    coParentToken = getTestTokenForUser({
      sub: 'auth0|messaging-co-parent',
      email: 'messaging-coparent@coparent.dev',
    });
  });

  afterAll(async () => {
    await app.close();
    clearTokenCache();
  });

  it('creates a message conversation', async () => {
    const response = await request(app.getHttpServer())
      .post(`/families/${familyId}/conversations/message`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        subject: 'School pickup',
        message: 'Can you cover pickup tomorrow?',
        recipientId: coParentId,
      })
      .expect(201);

    expect(response.body.type).toBe('message');
    expect(response.body.subject).toBe('School pickup');
    expect(response.body.messages).toHaveLength(1);
  });

  it('returns 400 with empty initial message', async () => {
    await request(app.getHttpServer())
      .post(`/families/${familyId}/conversations/message`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        subject: 'Empty message',
        message: '   ',
        recipientId: coParentId,
      })
      .expect(400);
  });

  it('creates a permission conversation', async () => {
    const response = await request(app.getHttpServer())
      .post(`/families/${familyId}/conversations/permission`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        subject: 'Medical consent',
        type: 'medical',
        childId,
        description: 'Need approval for treatment plan',
      })
      .expect(201);

    expect(response.body.type).toBe('permission');
    expect(response.body.permissionRequest.type).toBe('medical');
  });

  it('returns 400 with invalid permission type', async () => {
    await request(app.getHttpServer())
      .post(`/families/${familyId}/conversations/permission`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        subject: 'Invalid permission type',
        type: 'invalid-type',
        childId,
        description: 'Invalid type should fail',
      })
      .expect(400);
  });

  it('sends a message in an existing conversation', async () => {
    const conversation = await request(app.getHttpServer())
      .post(`/families/${familyId}/conversations/message`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        subject: 'Follow-up thread',
        message: 'Starting this thread',
        recipientId: coParentId,
      })
      .expect(201);

    const conversationId = conversation.body.id as string;

    const sendResponse = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${coParentToken}`)
      .send({ content: 'Replying from co-parent' })
      .expect(201);

    expect(sendResponse.body.messages.length).toBeGreaterThan(1);
  });

  it('marks conversation read', async () => {
    const conversation = await request(app.getHttpServer())
      .post(`/families/${familyId}/conversations/message`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        subject: 'Read status thread',
        message: 'Unread for co-parent',
        recipientId: coParentId,
      })
      .expect(201);

    const conversationId = conversation.body.id as string;

    const readResponse = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/mark-read`)
      .set('Authorization', `Bearer ${coParentToken}`)
      .expect(201);

    expect(readResponse.body.unreadCount).toBe(0);
  });

  it('lists family conversations', async () => {
    const response = await request(app.getHttpServer())
      .get(`/families/${familyId}/conversations`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('approves and denies permission requests', async () => {
    const approveConversation = await request(app.getHttpServer())
      .post(`/families/${familyId}/conversations/permission`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        subject: 'Approve this permission',
        type: 'travel',
        childId,
        description: 'Need travel approval',
      })
      .expect(201);

    const approvePermissionId = approveConversation.body.permissionRequest.id as string;

    const approveResponse = await request(app.getHttpServer())
      .post(`/permissions/${approvePermissionId}/approve`)
      .set('Authorization', `Bearer ${coParentToken}`)
      .send({ response: 'Approved' })
      .expect(201);

    expect(approveResponse.body.permissionRequest.status).toBe('approved');

    const denyConversation = await request(app.getHttpServer())
      .post(`/families/${familyId}/conversations/permission`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        subject: 'Deny this permission',
        type: 'schedule',
        childId,
        description: 'Need schedule approval',
      })
      .expect(201);

    const denyPermissionId = denyConversation.body.permissionRequest.id as string;

    const denyResponse = await request(app.getHttpServer())
      .post(`/permissions/${denyPermissionId}/deny`)
      .set('Authorization', `Bearer ${coParentToken}`)
      .send({ response: 'Denied' })
      .expect(201);

    expect(denyResponse.body.permissionRequest.status).toBe('denied');
  });

  it('returns 401 on protected endpoints without auth', async () => {
    await request(app.getHttpServer())
      .post(`/families/${familyId}/conversations/message`)
      .send({
        subject: 'No auth',
        message: 'Should fail',
        recipientId: coParentId,
      })
      .expect(401);

    await request(app.getHttpServer()).get(`/families/${familyId}/conversations`).expect(401);
  });
});
