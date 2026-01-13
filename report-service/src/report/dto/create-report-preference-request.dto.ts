import { IsEnum, IsOptional, IsInt } from 'class-validator';
import { ReportType, DeliveryMethod } from 'shared';

export class CreateReportPreferenceRequestDto {
  @IsInt()
  userId: number;

  @IsEnum(ReportType)
  reportType: ReportType;

  @IsEnum(DeliveryMethod)
  @IsOptional()
  deliveryMethod?: DeliveryMethod;
}