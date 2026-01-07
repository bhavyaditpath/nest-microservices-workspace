import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as shared from 'shared';

@Controller('inventory')
export class InventoryController {
  private readonly inventoryServiceUrl: string;

  constructor(private httpService: HttpService) {
    this.inventoryServiceUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3007';
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req, @Query() query: shared.InventorySearchParams) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/inventory`, {
        params: query,
        headers: { Authorization: req.headers.authorization }
      })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getStockSummary(@Request() req, @Query('search') search?: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/inventory/summary`, {
        params: { search },
        headers: { Authorization: req.headers.authorization }
      })
    );
    return response.data;
  }
}