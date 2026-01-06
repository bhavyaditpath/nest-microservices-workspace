import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, HttpException, Request } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('purchase')
export class PurchaseController {
  private readonly purchaseServiceUrl: string;

  constructor(private httpService: HttpService) {
    this.purchaseServiceUrl = process.env.PURCHASE_SERVICE_URL || 'http://localhost:3005';
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPurchaseDto: any, @Request() req) {
    createPurchaseDto.userId = req.user.id;
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.purchaseServiceUrl}/purchases`, createPurchaseDto)
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.id;
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());

    const url = `${this.purchaseServiceUrl}/purchases${params.toString() ? '?' + params.toString() : ''}`;
    const response = await firstValueFrom(
      this.httpService.get(url)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.purchaseServiceUrl}/purchases/${id}`)
    );
    return response.data;
  }

  // Internal routes for service-to-service communication (no auth required)
  @Get('internal/:id')
  async findOneInternal(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.purchaseServiceUrl}/purchases/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePurchaseDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.purchaseServiceUrl}/purchases/${id}`, updatePurchaseDto)
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.purchaseServiceUrl}/purchases/${id}`)
    );
    return response.data;
  }
}