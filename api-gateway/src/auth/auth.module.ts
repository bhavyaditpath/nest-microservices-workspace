import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'JWT_SECRET_KEY',
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
