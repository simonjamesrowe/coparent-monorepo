import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './jwt.strategy';
import { TestJwtStrategy } from './test-jwt.strategy';

const jwtStrategyProvider = process.env.E2E_TEST_MODE === 'true' ? TestJwtStrategy : JwtStrategy;

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [jwtStrategyProvider],
  exports: [PassportModule],
})
export class AuthModule {}
