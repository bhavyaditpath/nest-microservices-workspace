import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('request')
export class RequestController {
  private readonly requestServiceUrl: string;

  constructor(private httpService: HttpService) {
    this.requestServiceUrl = process.env.REQUEST_SERVICE_URL || 'http://localhost:3008';
  }

  @UseGuards(JwtAuthGuard)
  @Get('admins')
  async getAdminsForDropdown(@Query('productName') productName?: string) {
    try {
      console.log('API Gateway: Fetching admins for dropdown, productName:', productName);
      const response = await firstValueFrom(
        this.httpService.get(`${this.requestServiceUrl}/request/admins`, { params: { productName } })
      );
      console.log('API Gateway: Admins response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Gateway: Error fetching admins:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createRequestDto: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.requestServiceUrl}/request`, createRequestDto)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.requestServiceUrl}/request`, { params: query })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.requestServiceUrl}/request/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRequestDto: any) {
    const response = await firstValueFrom(
      this.httpService.patch(`${this.requestServiceUrl}/request/${id}`, updateRequestDto)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.requestServiceUrl}/request/${id}`)
    );
    return response.data;
  }
}