import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/test-utils';
import { getTestToken, clearTokenCache } from './helpers/auth.helper';

describe('Event Categories (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let familyId: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getTestToken();

    const familyResponse = await request(app.getHttpServer())
      .post('/families')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Event Categories Family',
        timeZone: 'America/New_York',
      })
      .expect(201);

    familyId = familyResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
    clearTokenCache();
  });

  it('creates an event category', async () => {
    const response = await request(app.getHttpServer())
      .post(`/families/${familyId}/event-categories`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Soccer',
        icon: 'ball',
        color: 'emerald',
        isDefault: true,
      })
      .expect(201);

    expect(response.body.name).toBe('Soccer');
    expect(response.body.icon).toBe('ball');
  });

  it('returns 400 for invalid payload', async () => {
    await request(app.getHttpServer())
      .post(`/families/${familyId}/event-categories`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        icon: 'calendar',
      })
      .expect(400);
  });

  it('lists categories', async () => {
    const response = await request(app.getHttpServer())
      .get(`/families/${familyId}/event-categories`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('updates and deletes a category', async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`/families/${familyId}/event-categories`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Temporary Category',
        icon: 'calendar',
        color: 'slate',
      })
      .expect(201);

    const categoryId = createResponse.body._id as string;

    const updateResponse = await request(app.getHttpServer())
      .put(`/families/${familyId}/event-categories/${categoryId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Category',
      })
      .expect(200);

    expect(updateResponse.body.name).toBe('Updated Category');

    await request(app.getHttpServer())
      .delete(`/families/${familyId}/event-categories/${categoryId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });

  it('returns 401 without auth', async () => {
    await request(app.getHttpServer()).get(`/families/${familyId}/event-categories`).expect(401);
  });
});
