import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportPreferenceDto } from './dto/create-report-preference.dto';
import { CreateReportPreferenceRequestDto } from './dto/create-report-preference-request.dto';
import { UpdateReportPreferenceDto } from './dto/update-report-preference.dto';
import { ApiResponseUtil, ReportType } from 'shared';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('daily')
  async getDailyReport(@Query('userId') userId?: string) {
    const data = await this.reportService.getDailyReport(userId ? parseInt(userId) : undefined);
    return data;
  }

  @Get('weekly')
  async getWeeklyReport(@Query('userId') userId?: string) {
    const data = await this.reportService.getWeeklyReport(userId ? parseInt(userId) : undefined);
    return data;
  }

  @Get('monthly')
  async getMonthlyReport(@Query('userId') userId?: string) {
    const data = await this.reportService.getMonthlyReport(userId ? parseInt(userId) : undefined);
    return data;
  }

  @Get('half-yearly')
  async getHalfYearlyReport(@Query('userId') userId?: string) {
    const data = await this.reportService.getHalfYearlyReport(userId ? parseInt(userId) : undefined);
    return data;
  }

  @Get('yearly')
  async getYearlyReport(@Query('userId') userId?: string) {
    const data = await this.reportService.getYearlyReport(userId ? parseInt(userId) : undefined);
    return data;
  }

  @Post('preferences')
  async createPreference(@Body() createReportPreferenceRequestDto: CreateReportPreferenceRequestDto) {
    const { userId, reportType, deliveryMethod } = createReportPreferenceRequestDto;
    const dto: CreateReportPreferenceDto = { reportType, deliveryMethod };
    return this.reportService.createPreference(userId, dto);
  }

  @Get('preferences')
  async getUserPreferences(@Query('userId', ParseIntPipe) userId: number) {
    const data = await this.reportService.findUserPreferences(userId);
    return ApiResponseUtil.success(data, 'User preferences retrieved successfully');
  }

  @Put('preferences/:id')
  async updatePreference(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateReportPreferenceDto) {
    return this.reportService.updatePreference(id, updateDto);
  }

  @Delete('preferences/:id')
  async removePreference(@Param('id', ParseIntPipe) id: number) {
    return this.reportService.removePreference(id);
  }

  @Post('generate-scheduled')
  async generateScheduledReports() {
    await this.reportService.processScheduledReports();
    return ApiResponseUtil.success(null, 'Scheduled reports generated successfully');
  }

  @Post('generate/:reportType')
  async generateReport(@Param('reportType') reportType: string, @Query('userId') userId?: string) {
    const filePath = await this.reportService.generateAndSaveReport(reportType as ReportType, userId ? parseInt(userId) : undefined);
    return ApiResponseUtil.success({ filePath }, 'Report generated and saved successfully');
  }
}