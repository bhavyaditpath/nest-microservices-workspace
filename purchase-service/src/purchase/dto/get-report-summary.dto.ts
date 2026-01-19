import { IsISO8601, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetReportSummaryDto {
  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
