import { Controller, Get, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('dashboard')
export class DashboardController {
  private readonly dashboardServiceUrl: string;

  constructor(private httpService: HttpService) {
    this.dashboardServiceUrl = process.env.DASHBOARD_SERVICE_URL || 'http://localhost:3011';
  }

  // Admin Dashboard APIs
  @UseGuards(JwtAuthGuard)
  @Get('admin/:userId/total-inventory')
  async getTotalInventory(@Req() req: Request, @Param('userId', ParseIntPipe) userId: number) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.get(`${this.dashboardServiceUrl}/dashboard/admin/${userId}/total-inventory`, { headers })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/active-branches')
  async getActiveBranches(@Req() req: Request) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.get(`${this.dashboardServiceUrl}/dashboard/admin/active-branches`, { headers })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:userId/monthly-sales')
  async getMonthlySales(@Req() req: Request, @Param('userId', ParseIntPipe) userId: number) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.get(`${this.dashboardServiceUrl}/dashboard/admin/${userId}/monthly-sales`, { headers })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:userId/pending-requests')
  async getPendingRequests(@Req() req: Request, @Param('userId', ParseIntPipe) userId: number) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.get(`${this.dashboardServiceUrl}/dashboard/admin/${userId}/pending-requests`, { headers })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/active-alerts-list')
  async getActiveAlertsList(@Req() req: Request, @Param('userId', ParseIntPipe) userId: number) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.get(`${this.dashboardServiceUrl}/dashboard/${userId}/active-alerts-list`, { headers })
    );
    return response.data;
  }

  // Branch Dashboard APIs
  @UseGuards(JwtAuthGuard)
  @Get('branch/:userId/current-stock')
  async getCurrentStock(@Req() req: Request, @Param('userId', ParseIntPipe) userId: number) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.get(`${this.dashboardServiceUrl}/dashboard/branch/${userId}/current-stock`, { headers })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('branch/:userId/active-alerts')
  async getActiveAlerts(@Req() req: Request, @Param('userId', ParseIntPipe) userId: number) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.get(`${this.dashboardServiceUrl}/dashboard/branch/${userId}/active-alerts`, { headers })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('branch/:userId/pending-orders')
  async getPendingOrders(@Req() req: Request, @Param('userId', ParseIntPipe) userId: number) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.get(`${this.dashboardServiceUrl}/dashboard/branch/${userId}/pending-orders`, { headers })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('branch/:userId/todays-buys')
  async getTodaysbuys(@Req() req: Request, @Param('userId', ParseIntPipe) userId: number) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.get(`${this.dashboardServiceUrl}/dashboard/branch/${userId}/todays-buys`, { headers })
    );
    return response.data;
  }
}
