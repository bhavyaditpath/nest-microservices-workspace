import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RequestStatus } from 'shared';

@Injectable()
export class DashboardService {
  private readonly apiGatewayUrl: string;

  constructor(private httpService: HttpService) {
    this.apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';
  }

  // Admin Dashboard APIs
  async getTotalInventory(userId: number): Promise<number> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/purchase`, {
        params: { userId },
      })
    );
    return response.data.data.length;
  }

  async getActiveBranches(): Promise<number> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/branch`)
    );
    return response.data.data.filter((branch: any) => !branch.isRemoved).length;
  }

  async getMonthlySales(userId: number): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const response = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/request`, {
        params: { adminUserId: userId },
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
        this.httpService.get(`${this.apiGatewayUrl}/purchase/${req.purchaseId}`)
      );
      const purchase = purchaseResponse.data;
      total += req.quantityRequested * purchase.pricePerUnit;
    }
    return total;
  }

  async getPendingRequests(userId: number): Promise<number> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/request`, {
        params: { adminUserId: userId },
      })
    );
    return response.data.data.filter((req: any) =>
      req.status === RequestStatus.REQUEST && !req.isRemoved
    ).length;
  }

  // Branch Dashboard APIs
  async getCurrentStock(userId: number): Promise<number> {
    // First get user to get branchId
    const userResponse = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/user/${userId}`)
    );
    const user = userResponse.data;
    if (!user || !user.branchId) return 0;

    const response = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/purchase`, {
        params: { branchId: user.branchId },
      })
    );
    const purchases = response.data.data.filter((p: any) => !p.isRemoved);
    return purchases.reduce((sum: number, p: any) => sum + p.quantity, 0);
  }

  async getActiveAlerts(userId: number): Promise<number> {
    // First get user to get branchId
    const userResponse = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/users/${userId}`)
    );
    const user = userResponse.data;
    if (!user || !user.branchId) return 0;

    // Since StockAlert is not created yet, comment out
    // const response = await firstValueFrom(
    //   this.httpService.get(`${this.apiGatewayUrl}/alert`, {
    //     params: { branchId: user.branchId },
    //   })
    // );
    // return response.data.data.filter((alert: any) =>
    //   alert.status === AlertStatus.ACTIVE && !alert.isRemoved
    // ).length;
    return 0; // Placeholder
  }

  async getActiveAlertsList(userId: number): Promise<any[]> {
    // First get user to get branchId
    const userResponse = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/user/${userId}`)
    );
    const user = userResponse.data;
    if (!user || !user.branchId) return [];

    // Since StockAlert is not created yet, comment out
    // const response = await firstValueFrom(
    //   this.httpService.get(`${this.apiGatewayUrl}/alert`, {
    //     params: { branchId: user.branchId },
    //   })
    // );
    // const alerts = response.data.data.filter((alert: any) =>
    //   alert.status === AlertStatus.ACTIVE && !alert.isRemoved
    // );
    // return alerts.map((alert: any) => ({
    //   id: alert.id,
    //   createdAt: alert.createdAt,
    //   itemName: alert.itemName,
    //   currentStock: alert.currentStock,
    //   shortage: alert.shortage,
    //   status: alert.status,
    //   branchId: alert.branchId,
    //   branch: { id: user.branchId, name: user.branchName }, // Assuming
    // }));
    return []; // Placeholder
  }

  async getPendingOrders(userId: number): Promise<number> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/request`, {
        params: { requestingUserId: userId },
      })
    );
    return response.data.data.filter((req: any) =>
      req.status === RequestStatus.REQUEST && !req.isRemoved
    ).length;
  }

  async getTodaysbuys(userId: number): Promise<number> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const response = await firstValueFrom(
      this.httpService.get(`${this.apiGatewayUrl}/request`, {
        params: { requestingUserId: userId },
      })
    );
    const requests = response.data.data.filter((req: any) =>
      req.status === RequestStatus.DELIVERED &&
      !req.isRemoved &&
      new Date(req.createdAt) >= startOfDay &&
      new Date(req.createdAt) <= endOfDay
    );

    let total = 0;
    for (const req of requests) {
      // Need to get purchase price
      const purchaseResponse = await firstValueFrom(
        this.httpService.get(`${this.apiGatewayUrl}/purchase/${req.purchaseId}`)
      );
      const purchase = purchaseResponse.data;
      total += req.quantityRequested * purchase.pricePerUnit;
    }
    return total;
  }
}
