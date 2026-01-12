import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('request')
export class RequestController {
  private readonly requestServiceUrl: string;

  constructor(private httpService: HttpService) {
    this.requestServiceUrl = process.env.REQUEST_SERVICE_URL || 'http://localhost:3008';
  }

  @UseGuards(JwtAuthGuard)
  @Get('admins')
  async getAdminsForDropdown(@Req() req: Request, @Query('productName') productName?: string) {
      const headers = { Authorization: req.headers.authorization };
      const response = await firstValueFrom(
        this.httpService.get(`${this.requestServiceUrl}/request/admins`, { params: { productName }, headers })
      );
      return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: Request, @Body() createRequestDto: any) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.post(`${this.requestServiceUrl}/request`, createRequestDto, { headers })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: Request, @Query() query: any) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.get(`${this.requestServiceUrl}/request`, { params: query, headers })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.get(`${this.requestServiceUrl}/request/${id}`, { headers })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() updateRequestDto: any) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.patch(`${this.requestServiceUrl}/request/${id}`, updateRequestDto, { headers })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const headers = { Authorization: req.headers.authorization };
    const response = await firstValueFrom(
      this.httpService.delete(`${this.requestServiceUrl}/request/${id}`, { headers })
    );
    return response.data;
  }
}