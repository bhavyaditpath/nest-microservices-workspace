import { Controller, Post, Body, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from 'src/common/enums/role.enum';
import { ApiResponseUtil } from 'shared/src/common/api-response.util';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const data = await this.authService.login(body.username, body.password);
    return ApiResponseUtil.success(data, 'Login successful');
  }

  @Post('register')
  async register(@Body() body: { username: string; password: string; role: UserRole; branchId?: number }) {
    const data = await this.authService.register(body.username, body.password, body.role, body.branchId);
    return ApiResponseUtil.success(data, 'User registered successfully');
  }

  @Post('validate')
  async validate(@Body() body: { token: string }) {
    const data = await this.authService.validateToken(body.token);
    return ApiResponseUtil.success(data, 'Token validated');
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const data = await this.authService.refreshToken(body.refreshToken);
    return ApiResponseUtil.success(data, 'Token refreshed');
  }

  @Post('logout')
  async logout(@Body() body: { refreshToken: string }) {
    const data = await this.authService.logout(body.refreshToken);
    return ApiResponseUtil.success(data, 'Logged out successfully');
  }
}
