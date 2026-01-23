import { Controller, Get, Post, Body, Put, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { ResolveAlertDto } from './dto/resolve-alert.dto';
import { DismissAlertDto } from './dto/dismiss-alert.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminOnlyGuard } from '../common/guards/admin-only.guard';
import { BranchAccessGuard } from '../common/guards/branch-access.guard';
import { Roles, CurrentUser, UserRole, AlertStatus } from 'shared';
import type { User } from 'shared';
import { ApiResponseUtil } from 'shared';

@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(AdminOnlyGuard)
  async create(@Body() createAlertDto: CreateAlertDto) {
    const data = await this.alertService.create(createAlertDto);
    return ApiResponseUtil.success(data, 'Alert created successfully');
  }

  @Get('branch/:branchId')
  @UseGuards(BranchAccessGuard)
  async findByBranch(
    @Param('branchId') branchId: string,
    @CurrentUser() user: User,
    @Query('status') status?: AlertStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? +page : 1;
    const limitNum = limit ? +limit : 10;
    const data = await this.alertService.findByBranch(+branchId, status, pageNum, limitNum);
    return ApiResponseUtil.success(data, 'Alerts retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.alertService.findOne(+id);
    return ApiResponseUtil.success(data, 'Alert retrieved successfully');
  }

  @Put(':id/resolve')
  async resolve(@Param('id') id: string, @Body() resolveAlertDto: ResolveAlertDto) {
    const data = await this.alertService.resolve(+id, resolveAlertDto);
    return ApiResponseUtil.success(data, 'Alert resolved successfully');
  }

  @Put(':id/dismiss')
  async dismiss(@Param('id') id: string, @Body() dismissAlertDto?: DismissAlertDto) {
    const data = await this.alertService.dismiss(+id, dismissAlertDto);
    return ApiResponseUtil.success(data, 'Alert dismissed successfully');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAlertDto: UpdateAlertDto) {
    const data = await this.alertService.update(+id, updateAlertDto);
    return ApiResponseUtil.success(data, 'Alert updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.alertService.remove(+id);
    return ApiResponseUtil.success(null, 'Alert deleted successfully');
  }

  @Post('generate/:branchId')
  async generateAlertsForBranch(@Param('branchId') branchId: string) {
    await this.alertService.generateAlertsForBranch(+branchId);
    return ApiResponseUtil.success(null, 'Alerts generated successfully');
  }
}