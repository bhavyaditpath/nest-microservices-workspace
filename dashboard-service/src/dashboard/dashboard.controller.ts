import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchAccessGuard } from '../common/guards/branch-access.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/role.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Admin Dashboard APIs
  @Get('admin/:userId/total-inventory')
  @Roles(UserRole.ADMIN)
  async getTotalInventory(@Param('userId', ParseIntPipe) userId: number): Promise<{ count: number }> {
    const count = await this.dashboardService.getTotalInventory(userId);
    return { count };
  }

  @Get('admin/active-branches')
  @Roles(UserRole.ADMIN)
  async getActiveBranches(): Promise<{ count: number }> {
    const count = await this.dashboardService.getActiveBranches();
    return { count };
  }

  @Get('admin/:userId/monthly-sales')
  @Roles(UserRole.ADMIN)
  async getMonthlySales(@Param('userId', ParseIntPipe) userId: number): Promise<{ count: number }> {
    const count = await this.dashboardService.getMonthlySales(userId);
    return { count };
  }

  @Get('admin/:userId/pending-requests')
  @Roles(UserRole.ADMIN)
  async getPendingRequests(@Param('userId', ParseIntPipe) userId: number): Promise<{ count: number }> {
    const count = await this.dashboardService.getPendingRequests(userId);
    return { count };
  }

  @Get(':userId/active-alerts-list')
  async getActiveAlertsList(@Param('userId', ParseIntPipe) userId: number): Promise<any[]> {
    return await this.dashboardService.getActiveAlertsList(userId);
  }

  // Branch Dashboard APIs
  @Get('branch/:userId/current-stock')
  @Roles(UserRole.BRANCH)
  @UseGuards(BranchAccessGuard)
  async getCurrentStock(@Param('userId', ParseIntPipe) userId: number): Promise<{ count: number }> {
    const count = await this.dashboardService.getCurrentStock(userId);
    return { count };
  }

  @Get('branch/:userId/active-alerts')
  @Roles(UserRole.BRANCH)
  @UseGuards(BranchAccessGuard)
  async getActiveAlerts(@Param('userId', ParseIntPipe) userId: number): Promise<{ count: number }> {
    const count = await this.dashboardService.getActiveAlerts(userId);
    return { count };
  }

  @Get('branch/:userId/pending-orders')
  @Roles(UserRole.BRANCH)
  async getPendingOrders(@Param('userId', ParseIntPipe) userId: number): Promise<{ count: number }> {
    const count = await this.dashboardService.getPendingOrders(userId);
    return { count };
  }

  @Get('branch/:userId/todays-buys')
  @Roles(UserRole.BRANCH)
  async getTodaysbuys(@Param('userId', ParseIntPipe) userId: number): Promise<{ count: number }> {
    const count = await this.dashboardService.getTodaysbuys(userId);
    return { count };
  }
}
