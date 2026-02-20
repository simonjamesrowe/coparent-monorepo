import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/test-utils';
import { getTestToken, clearTokenCache } from './helpers/auth.helper';

describe('Events (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let familyId: string;
  let childId: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getTestToken();

    const familyResponse = await request(app.getHttpServer())
      .post('/families')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Events Test Family',
        timeZone: 'America/New_York',
      })
      .expect(201);

    familyId = familyResponse.body.id;

    const childResponse = await request(app.getHttpServer())
      .post(`/families/${familyId}/children`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        fullName: 'Event Child',
        dateOfBirth: '2018-01-10',
      })
      .expect(201);

    childId = childResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
    clearTokenCache();
  });

  describe('POST /families/:id/events', () => {
    it('creates an event', async () => {
      const response = await request(app.getHttpServer())
        .post(`/families/${familyId}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'activity',
          title: 'Soccer Practice',
          startDate: '2026-03-01',
          endDate: '2026-03-01',
          allDay: false,
          startTime: '16:00',
          endTime: '17:00',
          childIds: [childId],
        })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe('Soccer Practice');
    });

    it('returns 400 when title is missing', async () => {
      await request(app.getHttpServer())
        .post(`/families/${familyId}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'activity',
          startDate: '2026-03-01',
          allDay: true,
          childIds: [childId],
        })
        .expect(400);
    });

    it('returns 400 with invalid startDate', async () => {
      await request(app.getHttpServer())
        .post(`/families/${familyId}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'activity',
          title: 'Invalid Date Event',
          startDate: 'not-a-date',
          allDay: true,
          childIds: [childId],
        })
        .expect(400);
    });

    it('returns 400 when childIds is missing', async () => {
      await request(app.getHttpServer())
        .post(`/families/${familyId}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'activity',
          title: 'Missing Child Event',
          startDate: '2026-03-01',
          allDay: true,
        })
        .expect(400);
    });

    it('returns 401 without auth', async () => {
      await request(app.getHttpServer())
        .post(`/families/${familyId}/events`)
        .send({
          type: 'activity',
          title: 'Unauthorized Event',
          startDate: '2026-03-01',
          allDay: true,
          childIds: [childId],
        })
        .expect(401);
    });
  });

  describe('GET /families/:id/events', () => {
    it('lists family events', async () => {
      const response = await request(app.getHttpServer())
        .get(`/families/${familyId}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('returns 401 without auth', async () => {
      await request(app.getHttpServer()).get(`/families/${familyId}/events`).expect(401);
    });
  });

  describe('PUT and DELETE /families/:id/events/:eventId', () => {
    it('updates and deletes an event', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/families/${familyId}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'school',
          title: 'Parent Conference',
          startDate: '2026-03-03',
          allDay: true,
          childIds: [childId],
        })
        .expect(201);

      const eventId = createResponse.body._id as string;

      const updateResponse = await request(app.getHttpServer())
        .put(`/families/${familyId}/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Parent Conference Updated',
          location: 'School Hall',
        })
        .expect(200);

      expect(updateResponse.body.title).toBe('Parent Conference Updated');
      expect(updateResponse.body.location).toBe('School Hall');

      await request(app.getHttpServer())
        .delete(`/families/${familyId}/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
