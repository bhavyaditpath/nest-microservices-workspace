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
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.pageSize) || 10;
    const search = params?.search?.trim();
    const sortBy = params?.sortBy;
    const sortOrder = params?.sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    return this.findWithPagination(user, page, pageSize, search, sortBy, sortOrder);
  }

  private async findWithPagination(
    user: User,
    page: number,
    pageSize: number,
    search?: string,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
  ) {
    let rows: PurchaseData[];
      // Call purchase-service to get purchases
      const url = `${this.purchaseServiceUrl}/purchases?userId=${user.id}`;
      const response = await firstValueFrom(this.httpService.get(url));
      rows = response.data.data;

    // Apply role-based filtering (assuming rows include request data)
    if (user.role === UserRole.ADMIN) {
      // Admin sees all their purchases
      rows = rows.filter(r => r.createdBy === user.id);
    } else {
      // Non-admin sees only purchases where request is null or delivered
      rows = rows.filter(r => r.createdBy === user.id && (!r.request || r.request.status === RequestStatus.DELIVERED));
    }

    if (search) {
      rows = rows.filter(r =>
        r.productName.toLowerCase().includes(search.toLowerCase()) ||
        r.brand.toLowerCase().includes(search.toLowerCase())
      );
    }

    const inventoryMap = new Map();

    for (const r of rows) {
      const key = `${r.productName}-${r.brand}-${r.branchId}`;

      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          id: r.id,
          productName: r.productName,
          brand: r.brand,
          currentQuantity: 0,
          unit: r.unit,
          pricePerUnit: r.pricePerUnit,
          lowStockThreshold: r.lowStockThreshold,
          branchId: r.branchId,
          branch: r.branch,
          lastPurchaseDate: r.createdAt,
          totalPurchased: 0,
        });
      }

      const item = inventoryMap.get(key);
      item.currentQuantity += Number(r.quantity);
      item.totalPurchased += Number(r.quantity);

      if (r.createdAt > item.lastPurchaseDate) {
        item.lastPurchaseDate = r.createdAt;
        item.pricePerUnit = r.pricePerUnit;
      }
    }

    let items = Array.from(inventoryMap.values());

    // Sort
    const validSort = ['productName', 'brand', 'currentQuantity', 'unit', 'lowStockThreshold', 'lastPurchaseDate'];
    const sortField = validSort.includes(sortBy || '') ? sortBy : 'productName';

    items.sort((a, b) => {
      let aVal: any = a[sortField as keyof typeof a];
      let bVal: any = b[sortField as keyof typeof b];

      let cmp: number;
      if (sortField === 'lastPurchaseDate') {
        cmp = new Date(aVal).getTime() - new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        cmp = aVal.localeCompare(bVal);
      } else {
        cmp = Number(aVal) - Number(bVal);
      }
      return sortOrder === 'DESC' ? -cmp : cmp;
    });

    const total = items.length;
    const offset = (page - 1) * pageSize;
    const paginatedItems = items.slice(offset, offset + pageSize);

    return {
      items: paginatedItems,
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