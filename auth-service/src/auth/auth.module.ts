import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserAuth } from './user-auth.entity';
import { JwtStrategy } from 'src/common/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAuth]),
    JwtModule.register({
      secret: 'JWT_SECRET_KEY', // move to env later
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
