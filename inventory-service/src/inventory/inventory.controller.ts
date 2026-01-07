import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import * as inventoryService from './inventory.service';
import * as shared from 'shared';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: inventoryService.InventoryService) {}

  @MessagePattern('inventory.findAll')
  async findAll(data: { user: any; query: shared.InventorySearchParams }) {
    const { user, query } = data;
    return this.inventoryService.findAll(user, query);
  }

  @MessagePattern('inventory.getStockSummary')
  async getStockSummary(data: { user: any; search?: string }) {
    const { user, search } = data;
    return this.inventoryService.getStockSummary(user, search);
  }
}