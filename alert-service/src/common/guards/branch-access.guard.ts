import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from 'shared';

@Injectable()
export class BranchAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = context.switchToHttp().getRequest().params;

    // Admin can access all branches
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Branch users can only access their own branch
    if (user.role === UserRole.BRANCH) {
      return user.branchId === +params.branchId;
    }

    return false;
  }
}