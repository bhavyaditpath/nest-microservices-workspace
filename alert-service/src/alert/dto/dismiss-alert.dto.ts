import { IsOptional, IsString } from 'class-validator';

export class DismissAlertDto {
  @IsOptional()
  @IsString()
  notes?: string;
}