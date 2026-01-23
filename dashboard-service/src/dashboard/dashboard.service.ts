import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RequestStatus, User, AlertStatus } from 'shared';

@Injectable()
export class DashboardService {
  private readonly userServiceUrl: string;
  private readonly branchServiceUrl: string;
  private readonly purchaseServiceUrl: string;
  private readonly requestServiceUrl: string;
  private readonly apiGatewayUrl: string;

  constructor(private httpService: HttpService) {
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3004';
    this.branchServiceUrl = process.env.BRANCH_SERVICE_URL || 'http://localhost:3003';
    this.purchaseServiceUrl = process.env.PURCHASE_SERVICE_URL || 'http://localhost:3006';
    this.requestServiceUrl = process.env.REQUEST_SERVICE_URL || 'http://localhost:3008';
    this.apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3002';
  }

  // Admin Dashboard APIs
  async getTotalInventory(user: User): Promise<number> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.purchaseServiceUrl}/purchases`, {
        params: { branchId: user.branchId },
      })
    );
    const purchases = response.data.data.filter((p: any) => !p.isRemoved);
    return purchases.length;
  }

  async getActiveBranches(): Promise<number> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.branchServiceUrl}/branches`)
    );
    return response.data.data.filter((branch: any) => !branch.isRemoved).length;
  }

  async getMonthlySales(user: User): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const response = await firstValueFrom(
      this.httpService.get(`${this.requestServiceUrl}/request`, {
        params: { branchId: user.branchId },
      })
    );
    const requests = response.data.data.filter((req: any) =>
      req.status === RequestStatus.DELIVERED &&
      !req.isRemoved &&
      new Date(req.createdAt) >= startOfMonth &&
      new Date(req.createdAt) <= endOfMonth
    );

    let total = 0;
    for (const req of requests) {
      // Need to get purchase price
      const purchaseResponse = await firstValueFrom(
        this.httpService.get(`${this.purchaseServiceUrl}/purchases/${req.purchaseId}`)
      );
      const purchase = purchaseResponse.data;
      total += req.quantityRequested * purchase.pricePerUnit;
    }
    return total;
  }

  async getPendingRequests(user: User): Promise<number> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.requestServiceUrl}/request`, {
        params: { branchId: user.branchId },
      })
    );
    return response.data.data.filter((req: any) =>
      req.status === RequestStatus.REQUEST && !req.isRemoved
    ).length;
  }

  // Branch Dashboard APIs
  async getCurrentStock(user: User): Promise<number> {
    if (!user || !user.branchId) return 0;

    const response = await firstValueFrom(
      this.httpService.get(`${this.requestServiceUrl}/request`, {
        params: { branchId: user.branchId },
      })
    );
    const requests = response.data.data.filter((req: any) =>
      req.status === RequestStatus.DELIVERED && !req.isRemoved
    );
    return requests.reduce((sum: number, req: any) => sum + Number(req.quantityRequested), 0);
  }

  async getActiveAlerts(userId: number): Promise<number> {
    // First get user to get branchId
    const userResponse = await firstValueFrom(
      this.httpService.get(`${this.userServiceUrl}/users/${userId}`)
    );
    const user = userResponse.data;
    if (!user || !user.branchId) return 0;

    const response = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/alerts/branch/${user.branchId}`, {
        params: { status: 'active' },
      })
    );
    return response.data.data.filter((alert: any) =>
      alert.status === AlertStatus.ACTIVE && !alert.isRemoved
    ).length;
  }

  async getActiveAlertsList(userId: number): Promise<any[]> {
    // First get user to get branchId
    const userResponse = await firstValueFrom(
      this.httpService.get(`${this.userServiceUrl}/users/${userId}`)
    );
    const user = userResponse.data;
    if (!user || !user.branchId) return [];

    const response = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/alerts/branch/${user.branchId}`, {
        params: { status: 'active' },
      })
    );
    const alerts = response.data.data.filter((alert: any) =>
      alert.status === AlertStatus.ACTIVE && !alert.isRemoved
    );
    return alerts.map((alert: any) => ({
      id: alert.id,
      createdAt: alert.createdAt,
      itemName: alert.itemName,
      currentStock: alert.currentStock,
      shortage: alert.shortage,
      status: alert.status,
      branchId: alert.branchId,
      branch: { id: user.branchId, name: user.branchName },
    }));
  }

  async getPendingOrders(user: User): Promise<number> {
    console.log('Dashboard Service: getPendingOrders started for user:', user.id, 'branchId:', user.branchId);
    const response = await firstValueFrom(
      this.httpService.get(`${this.requestServiceUrl}/request`, {
        params: { branchId: user.branchId },
      })
    );
    const filteredRequests = response.data.data.filter((req: any) =>
      req.status === RequestStatus.REQUEST && !req.isRemoved && req.requestingUserId === user.id
    );
    console.log('Dashboard Service: filtered pending requests:', filteredRequests);
    const count = filteredRequests.length;
    console.log('Dashboard Service: pending orders count:', count);
    return count;
  }

  async getTodaysbuys(user: User): Promise<number> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const response = await firstValueFrom(
      this.httpService.get(`${this.requestServiceUrl}/request`, {
        params: { branchId: user.branchId },
      })
    );
    const requests = response.data.data.filter((req: any) =>
      req.status === RequestStatus.DELIVERED &&
      !req.isRemoved &&
      new Date(req.createdAt) >= startOfDay &&
      new Date(req.createdAt) <= endOfDay &&
      req.requestingUserId === user.id
    );

    let total = 0;
    for (const req of requests) {
      // Need to get purchase price
      const purchaseResponse = await firstValueFrom(
        this.httpService.get(`${this.purchaseServiceUrl}/purchases/${req.purchaseId}`)
      );
      const purchase = purchaseResponse.data;
      total += req.quantityRequested * purchase.pricePerUnit;
    }
    return total;
  }
}
