import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { createTestApp } from './helpers/test-utils';
import { getTestToken, clearTokenCache } from './helpers/auth.helper';

describe('Parents (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testFamilyId: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getTestToken();

    // Create a test family
    const familyResponse = await request(app.getHttpServer())
      .post('/families')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Parents Test Family',
        timeZone: 'America/New_York',
      });
    testFamilyId = familyResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
    clearTokenCache();
  });

  describe('GET /me', () => {
    it('should return current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('auth0Id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('profiles');
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer()).get('/me').expect(401);
    });
  });

  describe('GET /families/:familyId/parents', () => {
    it('should return all parents in a family', async () => {
      const response = await request(app.getHttpServer())
        .get(`/families/${testFamilyId}/parents`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Should include the creating user as primary parent
      const primaryParent = response.body.find((p: any) => p.role === 'primary');
      expect(primaryParent).toBeDefined();
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer()).get(`/families/${testFamilyId}/parents`).expect(401);
    });

    it('should return 403 for family user does not belong to', async () => {
      // This test would need a different user token
      // For now, we test with a non-existent family ID
      await request(app.getHttpServer())
        .get('/families/507f1f77bcf86cd799439011/parents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('PATCH /parents/:id/role', () => {
    it('should return 400 with invalid role', async () => {
      // Get the parent ID first
      const parentsResponse = await request(app.getHttpServer())
        .get(`/families/${testFamilyId}/parents`)
        .set('Authorization', `Bearer ${authToken}`);

      const parentId = parentsResponse.body[0].id;

      await request(app.getHttpServer())
        .patch(`/parents/${parentId}/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 'invalid-role',
        })
        .expect(400);
    });

    it('should return 404 for non-existent parent', async () => {
      await request(app.getHttpServer())
        .patch('/parents/507f1f77bcf86cd799439011/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 'co-parent',
        })
        .expect(404);
    });
  });
});
