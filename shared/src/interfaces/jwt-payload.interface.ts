import { UserRole } from '../enums/role.enum';

export interface JwtPayload {
  sub: number;
  username: string;
  role: UserRole;
  branchId: number;
  type: 'access' | 'refresh';
}