import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  private readonly userServiceUrl: string;

  constructor(private httpService: HttpService) {
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3004';
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createUserDto: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.userServiceUrl}/users`, createUserDto)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('branchId') branchId?: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.userServiceUrl}/users`, { params: { branchId } })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('count')
  async count(@Query('branchId', ParseIntPipe) branchId: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.userServiceUrl}/users/count?branchId=${branchId}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.userServiceUrl}/users/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.userServiceUrl}/users/username/${username}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: any) {
    const response = await firstValueFrom(
      this.httpService.patch(`${this.userServiceUrl}/users/${id}`, updateUserDto)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.userServiceUrl}/users/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.patch(`${this.userServiceUrl}/users/${id}/restore`)
    );
    return response.data;
  }
}