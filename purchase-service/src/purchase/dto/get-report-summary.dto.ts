import { IsISO8601, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetReportSummaryDto {
  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  userId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  branchId?: number;
}
