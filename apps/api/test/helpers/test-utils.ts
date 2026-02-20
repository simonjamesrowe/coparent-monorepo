import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { MongooseExceptionFilter } from '../../src/common/filters/mongoose-exception.filter';

/**
 * Create a test application instance
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply same pipes as main.ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new MongooseExceptionFilter());

  await app.init();
  return app;
}

/**
 * Helper to make requests with auth token
 */
export function withAuth(request: any, token: string): any {
  return request.set('Authorization', `Bearer ${token}`);
}
