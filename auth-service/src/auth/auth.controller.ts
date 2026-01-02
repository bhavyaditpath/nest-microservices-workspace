import { Controller, Post, Body, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from 'src/common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }

  @Post('register')
  register(@Body() body: { username: string; password: string; role: UserRole; branchId?: number }) {
    return this.authService.register(body.username, body.password, body.role, body.branchId);
  }

  @Post('validate')
  validate(@Body() body: { token: string }) {
    return this.authService.validateToken(body.token);
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  logout(@Body() body: { refreshToken: string }) {
    return this.authService.logout(body.refreshToken);
  }
}
