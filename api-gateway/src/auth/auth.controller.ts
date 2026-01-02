import { Controller, Post, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(private httpService: HttpService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    // Forward the request to auth-service
    const response = await firstValueFrom(
      this.httpService.post('http://localhost:3001/auth/login', body)
    );
    return response.data;
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const response = await firstValueFrom(
      this.httpService.post('http://localhost:3001/auth/refresh', body)
    );
    return response.data;
  }

  @Post('logout')
  async logout(@Body() body: { refreshToken: string }) {
    const response = await firstValueFrom(
      this.httpService.post('http://localhost:3001/auth/logout', body)
    );
    return response.data;
  }
}