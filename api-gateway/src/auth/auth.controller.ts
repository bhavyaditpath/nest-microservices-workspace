import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private httpService: HttpService) {}

  @Post('register')
  async register(@Body() body: any) {
    const response = await firstValueFrom(
      this.httpService.post('http://localhost:3002/auth/register', body)
    );
    return response.data;
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    // Forward the request to auth-service
    const response = await firstValueFrom(
      this.httpService.post('http://localhost:3002/auth/login', body)
    );
    return response.data;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    const response = await firstValueFrom(
      this.httpService.post('http://localhost:3002/auth/forgot-password', body)
    );
    return response.data;
  }

  @Post('validate-reset-token')
  async validateResetToken(@Body() body: any) {
    const response = await firstValueFrom(
      this.httpService.post('http://localhost:3002/auth/validate-reset-token', body)
    );
    return response.data;
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    const response = await firstValueFrom(
      this.httpService.post('http://localhost:3002/auth/reset-password', body)
    );
    return response.data;
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const response = await firstValueFrom(
      this.httpService.post('http://localhost:3002/auth/refresh', { refresh_token: body.refreshToken })
    );
    return response.data;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:3002/auth/me', {
        headers: { 'user-id': userId.toString() }
      })
    );
    return response.data;
  }

  @Get('google')
  async googleAuth() {
    // Redirect to auth-service
    // But since it's get, perhaps redirect
  }

  @Get('google/callback')
  async googleAuthRedirect() {
    // Handle callback
  }
}