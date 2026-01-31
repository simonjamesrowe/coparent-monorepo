import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { FamiliesModule } from './families/families.module';
import { ParentsModule } from './parents/parents.module';
import { ChildrenModule } from './children/children.module';
import { InvitationsModule } from './invitations/invitations.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { EmailModule } from './email/email.module';
import { EventsModule } from './events/events.module';
import { ScheduleChangeRequestsModule } from './schedule-change-requests/schedule-change-requests.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        formatters: {
          level: (label) => ({ level: label }),
        },
        customProps: () => ({
          service: 'coparent-api',
          environment: process.env.NODE_ENV ?? 'development',
        }),
        redact: ['req.headers.authorization'],
      },
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    FamiliesModule,
    ParentsModule,
    ChildrenModule,
    InvitationsModule,
    OnboardingModule,
    EmailModule,
    EventsModule,
    ScheduleChangeRequestsModule,
    MessagingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
