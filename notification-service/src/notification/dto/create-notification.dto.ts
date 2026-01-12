import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { NotificationType } from 'shared';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsNumber()
  branchId?: number;
}