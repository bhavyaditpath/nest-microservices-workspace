import { IsEnum, IsOptional } from 'class-validator';
import { ReportType, DeliveryMethod } from 'shared';

export class CreateReportPreferenceRequestDto {
  userId: number;

  @IsEnum(ReportType)
  reportType: ReportType;

  @IsEnum(DeliveryMethod)
  @IsOptional()
  deliveryMethod?: DeliveryMethod;
}