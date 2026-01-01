import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { createTestApp } from './helpers/test-utils';
import { getTestToken, clearTokenCache } from './helpers/auth.helper';

describe('Onboarding (e2e)', () => {
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
        name: 'Onboarding Test Family',
        timeZone: 'America/New_York',
      });
    testFamilyId = familyResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
    clearTokenCache();
  });

  describe('GET /onboarding/:familyId', () => {
    it('should return onboarding state for a family', async () => {
      const response = await request(app.getHttpServer())
        .get(`/onboarding/${testFamilyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('familyId');
      expect(response.body).toHaveProperty('currentStep');
      expect(response.body).toHaveProperty('completedSteps');
      expect(response.body).toHaveProperty('isComplete');
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer()).get(`/onboarding/${testFamilyId}`).expect(401);
    });

    it('should return 404 for non-existent family', async () => {
      await request(app.getHttpServer())
        .get('/onboarding/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /onboarding/:familyId', () => {
    it('should update onboarding current step', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/onboarding/${testFamilyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentStep: 'child',
        })
        .expect(200);

      expect(response.body.currentStep).toBe('child');
    });

    it('should update completed steps', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/onboarding/${testFamilyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedSteps: ['account', 'family'],
        })
        .expect(200);

      expect(response.body.completedSteps).toContain('account');
      expect(response.body.completedSteps).toContain('family');
    });

    it('should mark onboarding as complete', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/onboarding/${testFamilyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isComplete: true,
        })
        .expect(200);

      expect(response.body.isComplete).toBe(true);
      expect(response.body.currentStep).toBe('complete');
    });

    it('should return 400 with invalid step', async () => {
      await request(app.getHttpServer())
        .patch(`/onboarding/${testFamilyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentStep: 'invalid-step',
        })
        .expect(400);
    });
  });

  describe('POST /onboarding/:familyId/complete-step', () => {
    let newFamilyId: string;

    beforeAll(async () => {
      // Create a fresh family for this test
      const familyResponse = await request(app.getHttpServer())
        .post('/families')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Complete Step Test Family',
          timeZone: 'America/New_York',
        });
      newFamilyId = familyResponse.body.id;
    });

    it('should complete a step and advance to next', async () => {
      const response = await request(app.getHttpServer())
        .post(`/onboarding/${newFamilyId}/complete-step`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          step: 'family',
        })
        .expect(200);

      expect(response.body.completedSteps).toContain('family');
      expect(response.body.currentStep).toBe('child');
    });

    it('should complete review step and mark onboarding complete', async () => {
      // First complete the intermediate steps
      await request(app.getHttpServer())
        .patch(`/onboarding/${newFamilyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentStep: 'review',
          completedSteps: ['account', 'family', 'child', 'invite'],
        });

      const response = await request(app.getHttpServer())
        .post(`/onboarding/${newFamilyId}/complete-step`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          step: 'review',
        })
        .expect(200);

      expect(response.body.isComplete).toBe(true);
      expect(response.body.currentStep).toBe('complete');
    });
  });
});
