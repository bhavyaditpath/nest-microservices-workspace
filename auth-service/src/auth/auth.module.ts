import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserAuth } from './user-auth.entity';
import { RefreshToken } from './refresh-token.entity';
import { JwtStrategy } from 'src/common/jwt.strategy';
import { EmailService } from './email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAuth, RefreshToken]),
    JwtModule.register({
      secret: 'JWT_SECRET_KEY', // move to env later
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService],
})
export class AuthModule {}
