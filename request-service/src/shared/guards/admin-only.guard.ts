import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from 'shared';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user.role === UserRole.ADMIN;
  }
}