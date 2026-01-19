import { Controller, Get, Post, Put, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'shared';

@Controller('reports')
export class ReportController {
  private readonly reportServiceUrl: string;

  constructor(private httpService: HttpService) {
    this.reportServiceUrl = process.env.REPORT_SERVICE_URL || 'http://localhost:3010';
  }

  @UseGuards(JwtAuthGuard)
  @Get('daily')
  async getDailyReport(@CurrentUser() user: any) {
    try {
      const params = new URLSearchParams();
      params.append('userId', user.userId.toString());
      const url = `${this.reportServiceUrl}/reports/daily?${params.toString()}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('weekly')
  async getWeeklyReport(@CurrentUser() user: any) {
    try {
      const params = new URLSearchParams();
      params.append('userId', user.userId.toString());
      const url = `${this.reportServiceUrl}/reports/weekly?${params.toString()}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('monthly')
  async getMonthlyReport(@CurrentUser() user: any) {
    try {
      const params = new URLSearchParams();
      params.append('userId', user.userId.toString());
      const url = `${this.reportServiceUrl}/reports/monthly?${params.toString()}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('half-yearly')
  async getHalfYearlyReport(@CurrentUser() user: any) {
    try {
      const params = new URLSearchParams();
      params.append('userId', user.userId.toString());
      const url = `${this.reportServiceUrl}/reports/half-yearly?${params.toString()}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('yearly')
  async getYearlyReport(@CurrentUser() user: any) {
    try {
      const params = new URLSearchParams();
      params.append('userId', user.userId.toString());
      const url = `${this.reportServiceUrl}/reports/yearly?${params.toString()}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('preferences')
  async createPreference(@CurrentUser() user: any, @Body() createPreferenceDto: any) {
    try {
      const requestBody = { ...createPreferenceDto, userId: user.userId };
      const response = await firstValueFrom(
        this.httpService.post(`${this.reportServiceUrl}/reports/preferences`, requestBody)
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  async findUserPreferences(@CurrentUser() user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reportServiceUrl}/reports/preferences?userId=${user.userId}`)
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('preferences/:id')
  async updatePreference(@Param('id', ParseIntPipe) id: number, @Body() updatePreferenceDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.reportServiceUrl}/reports/preferences/${id}`, updatePreferenceDto)
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('preferences/:id')
  async removePreference(@Param('id', ParseIntPipe) id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.reportServiceUrl}/reports/preferences/${id}`)
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-scheduled')
  async generateScheduledReports() {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.reportServiceUrl}/reports/generate-scheduled`)
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate/:reportType')
  async generateReport(@Param('reportType') reportType: string, @CurrentUser() user: any) {
    try {
      const params = new URLSearchParams();
      params.append('userId', user.userId.toString());
      const url = `${this.reportServiceUrl}/reports/generate/${reportType}?${params.toString()}`;
      const response = await firstValueFrom(
        this.httpService.post(url)
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }
}