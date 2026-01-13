import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReportController } from './report.controller';

@Module({
  imports: [HttpModule],
  controllers: [ReportController],
})
export class ReportModule {}