import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchAccessGuard } from '../common/guards/branch-access.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/role.enum';
import { User } from 'shared';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  // Admin Dashboard APIs
  @Get('admin/total-inventory')
  @Roles(UserRole.ADMIN)
  async getTotalInventory(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.dashboardService.getTotalInventory(user);
    return { count };
  }

  @Get('admin/active-branches')
  @Roles(UserRole.ADMIN)
  async getActiveBranches(): Promise<{ count: number }> {
    const count = await this.dashboardService.getActiveBranches();
    return { count };
  }

  @Get('admin/monthly-sales')
  @Roles(UserRole.ADMIN)
  async getMonthlySales(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.dashboardService.getMonthlySales(user);
    return { count };
  }

  @Get('admin/pending-requests')
  @Roles(UserRole.ADMIN)
  async getPendingRequests(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.dashboardService.getPendingRequests(user);
    return { count };
  }

  @Get(':userId/active-alerts-list')
  async getActiveAlertsList(@Param('userId', ParseIntPipe) userId: number): Promise<any[]> {
    return await this.dashboardService.getActiveAlertsList(userId);
  }

  // Branch Dashboard APIs
  @Get('branch/current-stock')
  @Roles(UserRole.BRANCH)
  async getCurrentStock(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.dashboardService.getCurrentStock(user);
    return { count };
  }

  @Get('branch/:userId/active-alerts')
  @Roles(UserRole.BRANCH)
  @UseGuards(BranchAccessGuard)
  async getActiveAlerts(@Param('userId', ParseIntPipe) userId: number, @CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.dashboardService.getActiveAlerts(userId);
    return { count };
  }

  @Get('branch/pending-orders')
  @Roles(UserRole.BRANCH)
  async getPendingOrders(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.dashboardService.getPendingOrders(user);
    return { count };
  }

  @Get('branch/todays-buys')
  @Roles(UserRole.BRANCH)
  async getTodaysbuys(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.dashboardService.getTodaysbuys(user);
    return { count };
  }
}

