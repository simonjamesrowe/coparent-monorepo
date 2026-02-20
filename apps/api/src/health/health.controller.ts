import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(@Inject(HealthCheckService) private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([async () => ({ app: { status: 'up' } })]);
  }
}
