import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from 'src/common/enums/role.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}