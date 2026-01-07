import { RequestStatus } from '../enums/request-status.enum';

export interface PurchaseData {
  id: number;
  productName: string;
  brand: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  branchId: number;
  createdAt: Date;
  createdBy: number;
  branch: { id: number; name: string } | null;
  request?: { status: RequestStatus } | null;
}