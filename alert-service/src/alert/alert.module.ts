import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { StockAlert } from './entities/alert.entity';
import { JwtStrategy } from '../common/jwt.strategy';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminOnlyGuard } from '../common/guards/admin-only.guard';
import { BranchAccessGuard } from '../common/guards/branch-access.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockAlert]),
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'JWT_SECRET_KEY',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AlertController],
  providers: [AlertService, JwtStrategy, RolesGuard, AdminOnlyGuard, BranchAccessGuard],
  exports: [AlertService],
})
export class AlertModule {}