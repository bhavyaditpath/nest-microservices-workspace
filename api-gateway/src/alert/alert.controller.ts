import { Controller, Get, Post, Body, Put, Patch, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alerts')
export class AlertController {
  private readonly alertServiceUrl: string;

  constructor(private httpService: HttpService) {
    this.alertServiceUrl = process.env.ALERT_SERVICE_URL || 'http://localhost:3012';
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createAlertDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.alertServiceUrl}/alerts`, createAlertDto)
      );
      return response.data;
    } catch (error) {
      console.error('Error creating alert', error);
      if (error.response) {
        throw new Error(error.response.data);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('branch/:branchId')
  async findByBranch(
    @Param('branchId') branchId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const url = `${this.alertServiceUrl}/alerts/branch/${branchId}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.alertServiceUrl}/alerts/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/resolve')
  async resolve(@Param('id') id: string, @Body() resolveAlertDto: any) {
    const response = await firstValueFrom(
      this.httpService.put(`${this.alertServiceUrl}/alerts/${id}/resolve`, resolveAlertDto)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/dismiss')
  async dismiss(@Param('id') id: string, @Body() dismissAlertDto?: any) {
    const response = await firstValueFrom(
      this.httpService.put(`${this.alertServiceUrl}/alerts/${id}/dismiss`, dismissAlertDto || {})
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAlertDto: any) {
    const response = await firstValueFrom(
      this.httpService.patch(`${this.alertServiceUrl}/alerts/${id}`, updateAlertDto)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.alertServiceUrl}/alerts/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate/:branchId')
  async generateAlertsForBranch(@Param('branchId') branchId: string) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.alertServiceUrl}/alerts/generate/${branchId}`)
    );
    return response.data;
  }
}