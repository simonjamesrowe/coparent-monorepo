import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/test-utils';
import { getTestToken, clearTokenCache } from './helpers/auth.helper';

describe('Families (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getTestToken();
  });

  afterAll(async () => {
    await app.close();
    clearTokenCache();
  });

  describe('POST /families', () => {
    it('should create a new family', async () => {
      const response = await request(app.getHttpServer())
        .post('/families')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Family',
          timeZone: 'America/New_York',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Family');
      expect(response.body.timeZone).toBe('America/New_York');
      expect(response.body.parentIds).toHaveLength(1);
      expect(response.body.childIds).toHaveLength(0);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/families')
        .send({
          name: 'Test Family',
          timeZone: 'America/New_York',
        })
        .expect(401);
    });

    it('should return 400 with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/families')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Empty name
        })
        .expect(400);
    });

    it('should return 400 with invalid time zone', async () => {
      await request(app.getHttpServer())
        .post('/families')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Family',
          timeZone: 'Invalid/TimeZone',
        })
        .expect(400);
    });
  });

  describe('GET /families', () => {
    it('should return user families', async () => {
      // First create a family
      await request(app.getHttpServer())
        .post('/families')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Family',
          timeZone: 'America/Chicago',
        });

      const response = await request(app.getHttpServer())
        .get('/families')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer()).get('/families').expect(401);
    });
  });

  describe('GET /families/:id', () => {
    it('should return a specific family', async () => {
      // Create a family first
      const createResponse = await request(app.getHttpServer())
        .post('/families')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Specific Family',
          timeZone: 'America/Denver',
        });

      const familyId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/families/${familyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(familyId);
      expect(response.body.name).toBe('Specific Family');
    });

    it('should return 404 for non-existent family', async () => {
      await request(app.getHttpServer())
        .get('/families/507f1f77bcf86cd799439011') // Valid ObjectId format but doesn't exist
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /families/:id', () => {
    it('should update family name', async () => {
      // Create a family first
      const createResponse = await request(app.getHttpServer())
        .post('/families')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Name',
          timeZone: 'America/Los_Angeles',
        });

      const familyId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/families/${familyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.timeZone).toBe('America/Los_Angeles'); // Unchanged
    });

    it('should update family time zone', async () => {
      // Create a family first
      const createResponse = await request(app.getHttpServer())
        .post('/families')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Timezone Test',
          timeZone: 'America/New_York',
        });

      const familyId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/families/${familyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          timeZone: 'Europe/London',
        })
        .expect(200);

      expect(response.body.timeZone).toBe('Europe/London');
    });
  });

  describe('DELETE /families/:id', () => {
    it('should soft delete a family', async () => {
      // Create a family first
      const createResponse = await request(app.getHttpServer())
        .post('/families')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'To Be Deleted',
          timeZone: 'America/New_York',
        });

      const familyId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/families/${familyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Family should not be accessible anymore
      await request(app.getHttpServer())
        .get(`/families/${familyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
