import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateRequestDto } from './create-request.dto';
import { RequestStatus } from 'shared';

export class UpdateRequestDto extends PartialType(CreateRequestDto) {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}