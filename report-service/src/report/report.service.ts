import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';
import { ReportPreference } from './entities/report-preference.entity';
import { CreateReportPreferenceDto } from './dto/create-report-preference.dto';
import { UpdateReportPreferenceDto } from './dto/update-report-preference.dto';
import { ReportType, DeliveryMethod, ApiResponseUtil, NotificationType, renderTemplate } from 'shared';

@Injectable()
export class ReportService {
  private readonly purchaseServiceUrl: string;
  private readonly userServiceUrl: string;
  private readonly authServiceUrl: string;
  private readonly notificationServiceUrl: string;

  constructor(
    @InjectRepository(ReportPreference)
    private reportPreferenceRepository: Repository<ReportPreference>,
    private httpService: HttpService,
  ) {
    this.purchaseServiceUrl = process.env.PURCHASE_SERVICE_URL || 'http://localhost:3006';
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3003';
    this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    this.notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3009';
  }

  async getDailyReport(branchId: number) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0); // Set to midnight today

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999); // Set to end of today
    return this.generateReport(startOfDay, endOfDay, branchId);
  }

  async getWeeklyReport(branchId: number) {
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.generateReport(startOfWeek, endOfWeek, branchId);
  }

  async getMonthlyReport(branchId: number) {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return this.generateReport(startOfMonth, endOfMonth, branchId);
  }

  async getHalfYearlyReport(branchId: number) {
    const now = new Date();
    const month = now.getMonth();

    const startOfHalfYear =
      month >= 6
        ? new Date(now.getFullYear(), 6, 1)
        : new Date(now.getFullYear(), 0, 1);

    startOfHalfYear.setHours(0, 0, 0, 0);

    const endOfHalfYear =
      month >= 6
        ? new Date(now.getFullYear(), 11, 31)
        : new Date(now.getFullYear(), 5, 30);

    endOfHalfYear.setHours(23, 59, 59, 999);

    return this.generateReport(startOfHalfYear, endOfHalfYear, branchId);
  }

  async getYearlyReport(branchId: number) {
    const now = new Date();

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const endOfYear = new Date(now.getFullYear(), 11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    return this.generateReport(startOfYear, endOfYear, branchId);
  }

  private async generateReport(startDate: Date, endDate: Date, branchId: number) {
    try {
      const url = `${this.purchaseServiceUrl}/purchases/report-summary?branchId=${branchId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

      const response = await firstValueFrom(this.httpService.get(url));
      return response.data.data;
    } catch (error) {
      console.error('Error fetching report summary:', error);
      throw new Error('Failed to generate report');
    }
  }

  async createPreference(userId: number, createDto: CreateReportPreferenceDto): Promise<any> {
    const existingPreference = await this.reportPreferenceRepository.findOne({
      where: {
        userId,
        reportType: createDto.reportType,
        deliveryMethod: createDto.deliveryMethod,
        isRemoved: false
      }
    });

    if (existingPreference) {
      return ApiResponseUtil.error(
        `Report preference for ${createDto.reportType} already exists for this user`
      );
    }

    const preference = this.reportPreferenceRepository.create({
      ...createDto,
      userId,
    });

    const savedPreference = await this.reportPreferenceRepository.save(preference);
    return ApiResponseUtil.success(savedPreference, 'Report preference created successfully');
  }


  async findUserPreferences(userId: number): Promise<ReportPreference[]> {
    return this.reportPreferenceRepository.find({
      where: { userId },
    });
  }

  async updatePreference(id: number, updateDto: UpdateReportPreferenceDto): Promise<any> {
    // First get the existing preference to check for unique constraint
    const existingPreference = await this.reportPreferenceRepository.findOne({ where: { id } });
    if (!existingPreference) {
      return ApiResponseUtil.error('Report preference not found');
    }

    // Check if user is trying to change report type and if it would create a duplicate
    if (updateDto.reportType && updateDto.reportType !== existingPreference.reportType) {
      const duplicateCheck = await this.reportPreferenceRepository.findOne({
        where: {
          userId: existingPreference.userId,
          reportType: updateDto.reportType,
          isRemoved: false
        }
      });

      if (duplicateCheck) {
        return ApiResponseUtil.error(`Report preference for ${updateDto.reportType} already exists for this user`);
      }
    }

    await this.reportPreferenceRepository.update(id, updateDto);
    const updatedPreference = await this.reportPreferenceRepository.findOne({ where: { id } });
    return ApiResponseUtil.success(updatedPreference, 'Report preference updated successfully');
  }

  async removePreference(id: number): Promise<any> {
    const preference = await this.reportPreferenceRepository.findOne({ where: { id } });
    if (!preference) {
      return ApiResponseUtil.error('Report preference not found');
    }

    await this.reportPreferenceRepository.update(id, { isRemoved: true });
    return ApiResponseUtil.success(null, 'Report preference removed successfully');
  }

  async getActivePreferences(userId: number): Promise<ReportPreference[]> {
    return this.reportPreferenceRepository.find({
      where: { userId, isActive: true, isRemoved: false },
    });
  }

  private getReportBasePath(): string {
    return 'D:\\Reports';
  }

  private getReportFolder(reportType: ReportType): string {
    const basePath = this.getReportBasePath();
    const folderName = reportType.toLowerCase();
    return path.join(basePath, folderName);
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private generateReportFileName(reportType: ReportType, userId?: number): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const userSuffix = userId ? `_user_${userId}` : '_all_users';
    return `${reportType}_${dateStr}_${timeStr}${userSuffix}.xlsx`;
  }

  private async generateReportData(reportType: ReportType, userId: number) {
    switch (reportType) {
      case ReportType.DAILY:
        return await this.getDailyReport(userId);
      case ReportType.WEEKLY:
        return await this.getWeeklyReport(userId);
      case ReportType.MONTHLY:
        return await this.getMonthlyReport(userId);
      case ReportType.HALF_YEARLY:
        return await this.getHalfYearlyReport(userId);
      case ReportType.YEARLY:
        return await this.getYearlyReport(userId);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  private createReportWorkbook(reportType: ReportType, reportData: any, userId?: number): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`);

    // Add report metadata
    worksheet.addRow(['Report Type', reportType.toUpperCase()]);
    worksheet.addRow(['Generated At', new Date().toLocaleString('en-GB', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    })]);
    worksheet.addRow(['User ID', userId || 'All Users']);
    worksheet.addRow(['Period Start', reportData.period.startDate.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    })]);
    worksheet.addRow(['Period End', reportData.period.endDate.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    })]);
    worksheet.addRow([]); // Empty row

    // Add summary section
    worksheet.addRow(['SUMMARY']);
    worksheet.addRow(['Total Purchases', reportData.summary.totalPurchases]);
    worksheet.addRow(['Total Quantity', reportData.summary.totalQuantity]);
    worksheet.addRow(['Total Price', reportData.summary.totalPrice]);
    worksheet.addRow(['Average Price', reportData.summary.averagePrice]);
    worksheet.addRow([]); // Empty row

    // Style the headers
    worksheet.getCell('A1').font = { bold: true };
    worksheet.getCell('A7').font = { bold: true };
    worksheet.getCell('A8').font = { bold: true };
    worksheet.getCell('A9').font = { bold: true };
    worksheet.getCell('A10').font = { bold: true };
    worksheet.getCell('A11').font = { bold: true };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    return workbook;
  }

  async generateAndSaveReport(reportType: ReportType, userId: number): Promise<string> {
    const reportData = await this.generateReportData(reportType, userId);

    const folderPath = this.getReportFolder(reportType);
    this.ensureDirectoryExists(folderPath);

    const fileName = this.generateReportFileName(reportType, userId);
    const filePath = path.join(folderPath, fileName);

    const workbook = this.createReportWorkbook(reportType, reportData, userId);
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  private async generateReportBuffer(reportType: ReportType, userId: number): Promise<Buffer> {
    const reportData = await this.generateReportData(reportType, userId);
    const workbook = this.createReportWorkbook(reportType, reportData, userId);
    return await workbook.xlsx.writeBuffer() as any;
  }

  private async getUserById(userId: number) {
    try {
      const url = `${this.userServiceUrl}/users/${userId}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  private async sendReportEmail(to: string, reportType: ReportType, buffer: Buffer, userId?: number): Promise<void> {
    const fileName = this.generateReportFileName(reportType, userId);
    const subject = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
    const generatedDate = new Date().toLocaleString();
    const reportTypeDisplay = reportType.charAt(0).toUpperCase() + reportType.slice(1).toLowerCase();
    const userDisplay = userId ? `User ID: ${userId}` : 'All Users';

    const html = renderTemplate("report-email", {
      reportTypeDisplay,
      reportTypeDisplayLower: reportTypeDisplay.toLowerCase(),
      generatedDate,
      userDisplay,
    });

    try {
      await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/send-report-email`, {
          to,
          subject,
          html,
          attachment: {
            filename: fileName,
            content: buffer,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        })
      );
    } catch (error) {
      console.error('Failed to send report email:', error);
    }
  }

  async processScheduledReports(): Promise<void> {
    const activePreferences = await this.reportPreferenceRepository.find({
      where: { isActive: true, isRemoved: false },
    });

    for (const preference of activePreferences) {
      try {
        if (preference.deliveryMethod === DeliveryMethod.LOCAL_FILE) {
          await this.generateAndSaveReport(preference.reportType, preference.userId);
          console.log(`Generated ${preference.reportType} report for user ${preference.userId}`);
          await this.createReportNotification(preference, preference.reportType, 'saved');
        } else if (preference.deliveryMethod === DeliveryMethod.EMAIL) {
          const reportBuffer = await this.generateReportBuffer(preference.reportType, preference.userId);
          const user = await this.getUserById(preference.userId);
          await this.sendReportEmail(user.email || user.username, preference.reportType, reportBuffer, preference.userId);
          console.log(`Sent ${preference.reportType} report via email to user ${preference.userId}`);
          await this.createReportNotification(preference, preference.reportType, 'sent');
        }
      } catch (error) {
        console.error(`Failed to generate report for user ${preference.userId}:`, error);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyReports() {
    console.log('Generating daily reports...');
    await this.processReportsByType(ReportType.DAILY);
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyReports() {
    console.log('Generating weekly reports...');
    await this.processReportsByType(ReportType.WEEKLY);
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyReports() {
    console.log('Generating monthly reports...');
    await this.processReportsByType(ReportType.MONTHLY);
  }

  @Cron('0 0 1 */6 *') // Every 6 months on the 1st day at midnight
  async handleHalfYearlyReports() {
    console.log('Generating half-yearly reports...');
    await this.processReportsByType(ReportType.HALF_YEARLY);
  }

  @Cron(CronExpression.EVERY_YEAR)
  async handleYearlyReports() {
    console.log('Generating yearly reports...');
    await this.processReportsByType(ReportType.YEARLY);
  }

  private async processReportsByType(reportType: ReportType): Promise<void> {
    const preferences = await this.reportPreferenceRepository.find({
      where: {
        reportType,
        isActive: true,
        isRemoved: false,
      },
    });

    for (const preference of preferences) {
      try {
        if (preference.deliveryMethod === DeliveryMethod.LOCAL_FILE) {
          await this.generateAndSaveReport(reportType, preference.userId);
          console.log(`Generated ${reportType} report for user ${preference.userId}`);
          await this.createReportNotification(preference, reportType, 'saved');
        } else if (preference.deliveryMethod === DeliveryMethod.EMAIL) {
          const reportBuffer = await this.generateReportBuffer(reportType, preference.userId);
          const user = await this.getUserById(preference.userId);
          await this.sendReportEmail(user.email, reportType, reportBuffer, preference.userId);
          console.log(`Sent ${reportType} report via email to user ${preference.userId}`);
          await this.createReportNotification(preference, reportType, 'sent');
        }
      } catch (error) {
        console.error(`Failed to generate ${reportType} report for user ${preference.userId}:`, error);
      }
    }
  }

  private async createReportNotification(
    preference: ReportPreference,
    reportType: ReportType,
    action: 'saved' | 'sent'
  ): Promise<void> {
    try {
      const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report ${action === 'sent' ? 'Sent' : 'Generated'}`;
      const message = `Your ${reportType.toLowerCase()} report has been ${action === 'sent' ? 'sent via email' : 'saved locally'}.`;

      await firstValueFrom(this.httpService.post(`${this.notificationServiceUrl}/notifications`, {
        title,
        message,
        type: NotificationType.USER,
        userId: preference.userId,
      }));
    } catch (error) {
      console.error('Failed to create report notification:', error);
    }
  }
}
