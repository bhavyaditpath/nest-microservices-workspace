import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { NotificationType } from 'shared';

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsNumber()
  branchId?: number;
}