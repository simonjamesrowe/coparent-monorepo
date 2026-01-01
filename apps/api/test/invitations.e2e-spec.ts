import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/test-utils';
import { getTestToken, clearTokenCache } from './helpers/auth.helper';

describe('Invitations (e2e)', () => {
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
        name: 'Invitations Test Family',
        timeZone: 'America/New_York',
      });
    testFamilyId = familyResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
    clearTokenCache();
  });

  describe('POST /families/:familyId/invitations', () => {
    it('should send an invitation to a co-parent', async () => {
      const response = await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'coparent@example.com',
          role: 'co-parent',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('coparent@example.com');
      expect(response.body.role).toBe('co-parent');
      expect(response.body.status).toBe('pending');
      expect(response.body).toHaveProperty('sentAt');
      expect(response.body).toHaveProperty('expiresAt');
    });

    it('should send an invitation with primary role', async () => {
      const response = await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'primary@example.com',
          role: 'primary',
        })
        .expect(201);

      expect(response.body.role).toBe('primary');
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/invitations`)
        .send({
          email: 'test@example.com',
          role: 'co-parent',
        })
        .expect(401);
    });

    it('should return 400 with invalid email', async () => {
      await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
          role: 'co-parent',
        })
        .expect(400);
    });

    it('should return 400 with invalid role', async () => {
      await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'test@example.com',
          role: 'invalid-role',
        })
        .expect(400);
    });

    it('should return 400 for duplicate pending invitation', async () => {
      const email = 'duplicate@example.com';

      // Send first invitation
      await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email,
          role: 'co-parent',
        })
        .expect(201);

      // Try to send duplicate
      await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email,
          role: 'co-parent',
        })
        .expect(400);
    });
  });

  describe('GET /families/:familyId/invitations', () => {
    it('should return all invitations for a family', async () => {
      const response = await request(app.getHttpServer())
        .get(`/families/${testFamilyId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get(`/families/${testFamilyId}/invitations`)
        .expect(401);
    });
  });

  describe('POST /invitations/:id/cancel', () => {
    it('should cancel a pending invitation', async () => {
      // Create an invitation first
      const createResponse = await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'tocancel@example.com',
          role: 'co-parent',
        });

      const invitationId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/invitations/${invitationId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('canceled');
      expect(response.body).toHaveProperty('canceledAt');
    });

    it('should return 404 for non-existent invitation', async () => {
      await request(app.getHttpServer())
        .post('/invitations/507f1f77bcf86cd799439011/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /invitations/:id/resend', () => {
    it('should resend a pending invitation', async () => {
      // Create an invitation first
      const createResponse = await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'toresend@example.com',
          role: 'co-parent',
        });

      const invitationId = createResponse.body.id;
      const originalSentAt = createResponse.body.sentAt;

      // Wait a moment to ensure timestamp differs
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app.getHttpServer())
        .post(`/invitations/${invitationId}/resend`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('pending');
      expect(response.body.sentAt).not.toBe(originalSentAt);
    });
  });
});
