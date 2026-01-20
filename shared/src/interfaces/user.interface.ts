import { UserRole } from '../enums/role.enum';

export interface User {
  id: number;
  role: UserRole;
  branchId?: number;
}