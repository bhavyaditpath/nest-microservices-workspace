import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ReportPreference } from './entities/report-preference.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportPreference]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}