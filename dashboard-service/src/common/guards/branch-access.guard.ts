import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';

@Injectable()
export class BranchAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // Allow if user is admin or has branchId
    return user.role === UserRole.ADMIN || (user.role === UserRole.BRANCH && user.branchId);
  }
}