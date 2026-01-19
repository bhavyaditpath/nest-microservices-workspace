import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [HttpModule],
  controllers: [DashboardController],
})
export class DashboardModule {}