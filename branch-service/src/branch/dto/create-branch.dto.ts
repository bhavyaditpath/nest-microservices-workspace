import { IsString, IsOptional, IsNumberString, IsBoolean } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumberString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isRemoved?: boolean;
}