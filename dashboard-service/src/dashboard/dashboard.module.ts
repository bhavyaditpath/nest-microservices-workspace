import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { JwtStrategy } from '../common/jwt.strategy';

@Module({
  imports: [
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: 'JWT_SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [DashboardService, JwtStrategy],
  controllers: [DashboardController]
})
export class DashboardModule {}
