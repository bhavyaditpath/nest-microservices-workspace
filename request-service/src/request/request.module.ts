import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { Request } from './request.entity';
import { JwtStrategy } from '../common/jwt.strategy';
import { RolesGuard } from '../shared/guards/roles.guard';
import { AdminOnlyGuard } from '../shared/guards/admin-only.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request]),
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: 'JWT_SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [RequestController],
  providers: [RequestService, JwtStrategy, RolesGuard, AdminOnlyGuard],
})
export class RequestModule {}