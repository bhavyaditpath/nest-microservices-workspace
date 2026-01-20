import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRequestDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  adminUserId: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsNotEmpty()
  purchaseId: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  quantityRequested: number;

  @IsOptional()
  @IsString()
  notes?: string;
}