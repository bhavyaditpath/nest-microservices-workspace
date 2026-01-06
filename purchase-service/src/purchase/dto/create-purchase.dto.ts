import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePurchaseDto {
  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  pricePerUnit: number;

  @IsNumber()
  totalPrice: number;

  @IsNumber()
  lowStockThreshold: number;

  @IsString()
  brand: string;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  branchId?: number;
}