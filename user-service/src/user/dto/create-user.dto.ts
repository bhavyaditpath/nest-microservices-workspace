import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';

export class CreateUserDto {
  @IsEmail()
  username: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsNumber()
  branchId: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}