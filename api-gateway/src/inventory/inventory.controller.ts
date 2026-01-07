import { Controller, Get, Query, UseGuards, Request, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponseUtil } from 'shared';
import * as shared from 'shared';

@Controller('inventory')
export class InventoryController {
  constructor(
    @Inject('INVENTORY_SERVICE') private client: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req, @Query() query: shared.InventorySearchParams) {
    const user = req.user;
    const result = await this.client.send('inventory.findAll', { user, query }).toPromise();
    return ApiResponseUtil.success(result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getStockSummary(@Request() req, @Query('search') search?: string) {
    const user = req.user;
    const summary = await this.client.send('inventory.getStockSummary', { user, search }).toPromise();
    return ApiResponseUtil.success(summary);
  }
}