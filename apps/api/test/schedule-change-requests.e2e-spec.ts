import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/test-utils';
import { clearTokenCache, getTestToken, getTestTokenForUser } from './helpers/auth.helper';
import { addCoParentToFamily } from './helpers/db.helper';

describe('Schedule Change Requests (e2e)', () => {
  let app: INestApplication;
  let primaryToken: string;
  let coParentToken: string;
  let familyId: string;

  beforeAll(async () => {
    app = await createTestApp();
    primaryToken = await getTestToken();

    const familyResponse = await request(app.getHttpServer())
      .post('/families')
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        name: 'Schedule Requests Family',
        timeZone: 'America/New_York',
      })
      .expect(201);

    familyId = familyResponse.body.id;

    await addCoParentToFamily(app, familyId, {
      auth0Id: 'auth0|schedule-coparent',
      email: 'schedule-coparent@coparent.dev',
      fullName: 'Schedule CoParent',
    });

    coParentToken = getTestTokenForUser({
      sub: 'auth0|schedule-coparent',
      email: 'schedule-coparent@coparent.dev',
    });
  });

  afterAll(async () => {
    await app.close();
    clearTokenCache();
  });

  it('creates a schedule change request', async () => {
    const response = await request(app.getHttpServer())
      .post(`/families/${familyId}/schedule-change-requests`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        proposedChange: {
          type: 'swap',
          newStartDate: '2026-04-10',
          newEndDate: '2026-04-11',
        },
        reason: 'Need to swap due to work travel',
      })
      .expect(201);

    expect(response.body.status).toBe('pending');
    expect(response.body.reason).toBe('Need to swap due to work travel');
  });

  it('returns 400 when required fields are missing', async () => {
    await request(app.getHttpServer())
      .post(`/families/${familyId}/schedule-change-requests`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        reason: 'Missing proposed change',
      })
      .expect(400);
  });

  it('lists and fetches a specific request', async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`/families/${familyId}/schedule-change-requests`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        proposedChange: {
          type: 'add',
          newStartDate: '2026-04-12',
          newEndDate: '2026-04-12',
        },
        reason: 'Need additional care day',
      })
      .expect(201);

    const requestId = createResponse.body._id as string;

    const listResponse = await request(app.getHttpServer())
      .get(`/families/${familyId}/schedule-change-requests`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.length).toBeGreaterThan(0);

    const oneResponse = await request(app.getHttpServer())
      .get(`/families/${familyId}/schedule-change-requests/${requestId}`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .expect(200);

    expect(oneResponse.body._id).toBe(requestId);
  });

  it('approves and declines requests from co-parent account', async () => {
    const approveCreate = await request(app.getHttpServer())
      .post(`/families/${familyId}/schedule-change-requests`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        proposedChange: {
          type: 'extend',
          newStartDate: '2026-04-13',
          newEndDate: '2026-04-14',
        },
        reason: 'Need extended care window',
      })
      .expect(201);

    const approveId = approveCreate.body._id as string;

    const approveResponse = await request(app.getHttpServer())
      .post(`/families/${familyId}/schedule-change-requests/${approveId}/approve`)
      .set('Authorization', `Bearer ${coParentToken}`)
      .send({ responseNote: 'Approved from co-parent' })
      .expect(201);

    expect(approveResponse.body.status).toBe('approved');

    const declineCreate = await request(app.getHttpServer())
      .post(`/families/${familyId}/schedule-change-requests`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        proposedChange: {
          type: 'remove',
          newStartDate: '2026-04-15',
          newEndDate: '2026-04-15',
        },
        reason: 'Need to decline this proposed change',
      })
      .expect(201);

    const declineId = declineCreate.body._id as string;

    const declineResponse = await request(app.getHttpServer())
      .post(`/families/${familyId}/schedule-change-requests/${declineId}/decline`)
      .set('Authorization', `Bearer ${coParentToken}`)
      .send({ responseNote: 'Declined from co-parent' })
      .expect(201);

    expect(declineResponse.body.status).toBe('declined');
  });

  it('deletes own request', async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`/families/${familyId}/schedule-change-requests`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .send({
        proposedChange: {
          type: 'swap',
          newStartDate: '2026-04-16',
          newEndDate: '2026-04-16',
        },
        reason: 'Request to delete',
      })
      .expect(201);

    const requestId = createResponse.body._id as string;

    await request(app.getHttpServer())
      .delete(`/families/${familyId}/schedule-change-requests/${requestId}`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .expect(204);
  });

  it('returns 404 for invalid request IDs', async () => {
    await request(app.getHttpServer())
      .get(`/families/${familyId}/schedule-change-requests/507f1f77bcf86cd799439011`)
      .set('Authorization', `Bearer ${primaryToken}`)
      .expect(404);
  });

  it('returns 401 without auth', async () => {
    await request(app.getHttpServer())
      .post(`/families/${familyId}/schedule-change-requests`)
      .send({
        proposedChange: {
          type: 'swap',
          newStartDate: '2026-04-17',
          newEndDate: '2026-04-17',
        },
        reason: 'No auth should fail',
      })
      .expect(401);
  });
});
