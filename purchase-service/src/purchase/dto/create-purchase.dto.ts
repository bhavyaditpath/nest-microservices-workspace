import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePurchaseDto {
  @IsString()
  productName: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  pricePerUnit: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  totalPrice: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  lowStockThreshold: number;

  @IsString()
  brand: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  userId: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : value)
  @IsNumber()
  branchId?: number;
}