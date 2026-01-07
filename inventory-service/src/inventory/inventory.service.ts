import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InventorySearchParams, PurchaseData, User, UserRole } from 'shared';
import { RequestStatus } from 'shared';

@Injectable()
export class InventoryService {
  private readonly purchaseServiceUrl: string;

  constructor(private httpService: HttpService) {
    this.purchaseServiceUrl = process.env.PURCHASE_SERVICE_URL || 'http://localhost:3006';
  }

  async findAll(user: User, params?: InventorySearchParams) {
    const page = Math.max(Number(params?.page) || 1, 1);
    const pageSize = Math.max(Number(params?.pageSize) || 10, 1);

    return this.findWithPagination(
      user,
      page,
      pageSize,
      params?.search?.trim(),
      params?.sortBy,
      params?.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
    );
  }

  private async findWithPagination(
    user: User,
    page: number,
    pageSize: number,
    search?: string,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
  ) {
    const url = `${this.purchaseServiceUrl}/purchases?userId=${user.id}`;
    const response = await firstValueFrom(this.httpService.get(url));
    const rows: PurchaseData[] = response.data.data ?? [];

    const filteredRows = rows.filter(r => {
      if (r.createdBy !== user.id) return false;

      if (user.role === UserRole.ADMIN) return true;

      return !r.request || r.request.status === RequestStatus.DELIVERED;
    });

    const searchedRows = search
      ? filteredRows.filter(r =>
        r.productName.toLowerCase().includes(search.toLowerCase()) ||
        r.brand.toLowerCase().includes(search.toLowerCase())
      )
      : filteredRows;

    const inventoryMap = new Map<string, any>();

    for (const r of searchedRows) {
      const key = `${r.productName}-${r.brand}-${r.branchId}`;
      const quantity = Number(r.quantity);

      let item = inventoryMap.get(key);

      if (!item) {
        item = {
          id: r.id,
          productName: r.productName,
          brand: r.brand,
          currentQuantity: 0,
          totalPurchased: 0,
          unit: r.unit,
          pricePerUnit: 0,
          lowStockThreshold: r.lowStockThreshold,
          branchId: r.branchId,
          branch: r.branch,
          lastPurchaseDate: r.createdAt,
          totalPrice: 0,
          totalQuantityForPrice: 0,
        };
        inventoryMap.set(key, item);
      }

      item.currentQuantity += quantity;
      item.totalPurchased += quantity;
      item.totalPrice += quantity * r.pricePerUnit;
      item.totalQuantityForPrice += quantity;

      if (r.createdAt > item.lastPurchaseDate) {
        item.lastPurchaseDate = r.createdAt;
      }
    }

    for (const item of inventoryMap.values()) {
      if (item.totalQuantityForPrice > 0) {
        item.pricePerUnit = item.totalPrice / item.totalQuantityForPrice;
      }
    }

    let items = Array.from(inventoryMap.values());

    const allowedSortFields = new Set([
      'productName',
      'brand',
      'currentQuantity',
      'unit',
      'lowStockThreshold',
      'lastPurchaseDate',
    ]);

    const sortField = allowedSortFields.has(sortBy ?? '') ? sortBy! : 'productName';

    items.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      let result: number;

      if (sortField === 'lastPurchaseDate') {
        result = new Date(aVal).getTime() - new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        result = aVal.localeCompare(bVal);
      } else {
        result = Number(aVal) - Number(bVal);
      }

      return sortOrder === 'DESC' ? -result : result;
    });

    const total = items.length;
    const offset = (page - 1) * pageSize;

    return {
      items: items.slice(offset, offset + pageSize),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getStockSummary(user: User, search?: string) {
    let rows: PurchaseData[];
    try {
      const url = `${this.purchaseServiceUrl}/purchases?userId=${user.id}`;
      const response = await firstValueFrom(this.httpService.get(url));
      rows = response.data.data;
    } catch (error) {
      console.error('Error calling purchase service:', error);
      throw new Error('Failed to fetch purchases from purchase service');
    }

    // Apply role-based filtering
    if (user.role === UserRole.ADMIN) {
      rows = rows.filter(r => r.createdBy === user.id);
    } else {
      rows = rows.filter(r => r.createdBy === user.id && (!r.request || r.request.status === RequestStatus.DELIVERED));
    }

    if (search) {
      rows = rows.filter(r =>
        r.productName.toLowerCase().includes(search.toLowerCase()) ||
        r.brand.toLowerCase().includes(search.toLowerCase())
      );
    }

    const inventoryMap = new Map<string, any>();

    for (const r of rows) {
      const key = `${r.productName}-${r.brand}-${r.branchId}`;

      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          currentQuantity: 0,
          lowStockThreshold: r.lowStockThreshold,
        });
      }

      const item = inventoryMap.get(key);
      item.currentQuantity += Number(r.quantity);
    }

    let low = 0;
    let warning = 0;
    let good = 0;

    for (const item of inventoryMap.values()) {
      if (item.currentQuantity <= item.lowStockThreshold) {
        low++;
      } else if (item.currentQuantity <= item.lowStockThreshold * 2) {
        warning++;
      } else {
        good++;
      }
    }

    return {
      low,
      warning,
      good,
    };
  }
}