import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private httpService: HttpService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createUserDto: any) {
    const response = await firstValueFrom(
      this.httpService.post('http://localhost:3004/users', createUserDto)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('branchId') branchId?: string) {
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:3004/users', { params: { branchId } })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.get(`http://localhost:3004/users/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    const response = await firstValueFrom(
      this.httpService.get(`http://localhost:3004/users/username/${username}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: any) {
    const response = await firstValueFrom(
      this.httpService.patch(`http://localhost:3004/users/${id}`, updateUserDto)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.delete(`http://localhost:3004/users/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.patch(`http://localhost:3004/users/${id}/restore`)
    );
    return response.data;
  }
}