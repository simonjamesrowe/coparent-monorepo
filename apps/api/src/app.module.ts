import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        formatters: {
          level: (label) => ({ level: label })
        },
        customProps: () => ({
          service: 'coparent-api',
          environment: process.env.NODE_ENV ?? 'development'
        }),
        redact: ['req.headers.authorization']
      }
    }),
    AuthModule,
    HealthModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
