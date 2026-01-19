import { IsEnum, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ReportType, DeliveryMethod } from 'shared';

export class CreateReportPreferenceRequestDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(ReportType)
  reportType: ReportType;

  @IsEnum(DeliveryMethod)
  @IsOptional()
  deliveryMethod?: DeliveryMethod;
}