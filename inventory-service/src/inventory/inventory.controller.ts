import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiResponseUtil } from 'shared';
import * as inventoryService from './inventory.service';
import * as shared from 'shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: inventoryService.InventoryService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req, @Query() query: shared.InventorySearchParams) {
    const user: shared.User = { id: req.user.sub, role: req.user.role, branchId: req.user.branchId };
    const result = await this.inventoryService.findAll(user, query);
    return ApiResponseUtil.success(result, 'Inventory retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getStockSummary(@Request() req, @Query('search') search?: string) {
    const user: shared.User = { id: req.user.sub, role: req.user.role, branchId: req.user.branchId };
    const result = await this.inventoryService.getStockSummary(user, search);
    return ApiResponseUtil.success(result, 'Stock summary retrieved successfully');
  }
}