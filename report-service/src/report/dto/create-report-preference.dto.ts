import { IsEnum, IsOptional } from 'class-validator';
import { ReportType, DeliveryMethod } from 'shared';

export class CreateReportPreferenceDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsEnum(DeliveryMethod)
  @IsOptional()
  deliveryMethod?: DeliveryMethod;
}