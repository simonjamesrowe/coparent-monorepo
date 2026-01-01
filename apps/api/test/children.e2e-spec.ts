import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/test-utils';
import { getTestToken, clearTokenCache } from './helpers/auth.helper';

describe('Children (e2e)', () => {
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
        name: 'Children Test Family',
        timeZone: 'America/New_York',
      });
    testFamilyId = familyResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
    clearTokenCache();
  });

  describe('POST /families/:familyId/children', () => {
    it('should add a child to the family', async () => {
      const response = await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/children`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Emma Smith',
          dateOfBirth: '2018-05-15',
          school: 'Willow Creek Elementary',
          medicalNotes: 'Allergic to peanuts',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.fullName).toBe('Emma Smith');
      expect(response.body.dateOfBirth).toBe('2018-05-15');
      expect(response.body.school).toBe('Willow Creek Elementary');
      expect(response.body.medicalNotes).toBe('Allergic to peanuts');
    });

    it('should add a child with only required fields', async () => {
      const response = await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/children`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Jack Smith',
          dateOfBirth: '2020-08-22',
        })
        .expect(201);

      expect(response.body.fullName).toBe('Jack Smith');
      expect(response.body.school).toBeUndefined();
      expect(response.body.medicalNotes).toBeUndefined();
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/children`)
        .send({
          fullName: 'Test Child',
          dateOfBirth: '2019-01-01',
        })
        .expect(401);
    });

    it('should return 400 with missing required fields', async () => {
      await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/children`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Test Child',
          // Missing dateOfBirth
        })
        .expect(400);
    });

    it('should return 400 with invalid date format', async () => {
      await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/children`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Test Child',
          dateOfBirth: 'invalid-date',
        })
        .expect(400);
    });
  });

  describe('GET /families/:familyId/children', () => {
    it('should return all children in the family', async () => {
      const response = await request(app.getHttpServer())
        .get(`/families/${testFamilyId}/children`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get(`/families/${testFamilyId}/children`)
        .expect(401);
    });

    it('should return 404 for non-existent family', async () => {
      await request(app.getHttpServer())
        .get('/families/507f1f77bcf86cd799439011/children')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /children/:id', () => {
    it('should update child profile', async () => {
      // Create a child first
      const createResponse = await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/children`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Original Name',
          dateOfBirth: '2017-03-10',
        });

      const childId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/children/${childId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Updated Name',
          school: 'New School',
        })
        .expect(200);

      expect(response.body.fullName).toBe('Updated Name');
      expect(response.body.school).toBe('New School');
    });
  });

  describe('DELETE /children/:id', () => {
    it('should soft delete a child', async () => {
      // Create a child first
      const createResponse = await request(app.getHttpServer())
        .post(`/families/${testFamilyId}/children`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'To Be Deleted',
          dateOfBirth: '2019-06-15',
        });

      const childId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/children/${childId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Child should not be in the list anymore
      const listResponse = await request(app.getHttpServer())
        .get(`/families/${testFamilyId}/children`)
        .set('Authorization', `Bearer ${authToken}`);

      const deletedChild = listResponse.body.find(
        (c: any) => c.id === childId,
      );
      expect(deletedChild).toBeUndefined();
    });
  });
});
