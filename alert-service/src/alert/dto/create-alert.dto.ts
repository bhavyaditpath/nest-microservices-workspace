import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { AlertPriority, AlertType } from 'shared';

export class CreateAlertDto {
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @IsNotEmpty()
  @IsNumber()
  currentStock: number;

  @IsNotEmpty()
  @IsNumber()
  minStock: number;

  @IsNotEmpty()
  @IsNumber()
  shortage: number;

  @IsOptional()
  @IsEnum(AlertPriority)
  priority?: AlertPriority;

  @IsNotEmpty()
  @IsEnum(AlertType)
  alertType: AlertType;

  @IsNotEmpty()
  @IsNumber()
  branchId: number;
}