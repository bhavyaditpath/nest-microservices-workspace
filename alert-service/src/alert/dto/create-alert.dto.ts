import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { AlertPriority, AlertType } from 'shared';

export class CreateAlertDto {
  @IsString()
  itemName: string;

  @IsNumber()
  currentStock: number;

  @IsNumber()
  minStock: number;

  @IsNumber()
  shortage: number;

  @IsEnum(AlertType)
  alertType: AlertType;

  @IsNumber()
  branchId: number;

  @IsOptional()
  @IsEnum(AlertPriority)
  priority?: AlertPriority;
}