import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, HttpException, Request, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface CreateNotificationDto {
  title: string;
  message: string;
  type: string;
  userId?: number;
  branchId?: number;
}

@Controller('notifications')
export class NotificationController {
  private readonly notificationServiceUrl: string;
  private readonly logger = new Logger(NotificationController.name);

  constructor(private httpService: HttpService) {
    this.notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3009';
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    createNotificationDto.userId = req.user.userId;
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/notifications`, createNotificationDto)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error creating notification', error);
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: Record<string, unknown>) {
    const params = new URLSearchParams();
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined) params.append(key, String(query[key]));
    });

    const url = `${this.notificationServiceUrl}/notifications${params.toString() ? '?' + params.toString() : ''}`;
    const response = await firstValueFrom(
      this.httpService.get(url)
    );
    return response.data;
  }


  @UseGuards(JwtAuthGuard)
  @Get('latest')
  async findLatest(@Query() query: Record<string, unknown>, @Request() req) {
    const params = new URLSearchParams();
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined) params.append(key, String(query[key]));
    });
    params.append('userId', req.user.userId.toString());

    const url = `${this.notificationServiceUrl}/notifications/latest${params.toString() ? '?' + params.toString() : ''}`;
    const response = await firstValueFrom(
      this.httpService.get(url)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.notificationServiceUrl}/notifications/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async findByUser(@Param('userId', ParseIntPipe) userId: number, @Query() query: Record<string, unknown>) {
    const params = new URLSearchParams();
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined) params.append(key, String(query[key]));
    });

    const url = `${this.notificationServiceUrl}/notifications/user/${userId}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await firstValueFrom(
      this.httpService.get(url)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('branch/:branchId')
  async findByBranch(@Param('branchId', ParseIntPipe) branchId: number, @Query() query: Record<string, unknown>) {
    const params = new URLSearchParams();
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined) params.append(key, String(query[key]));
    });

    const url = `${this.notificationServiceUrl}/notifications/branch/${branchId}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await firstValueFrom(
      this.httpService.get(url)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Query('userId') userId: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.notificationServiceUrl}/notifications/unread-count?userId=${userId}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.notificationServiceUrl}/notifications/${id}/read?userId=${req.user.userId}`)
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
  @Patch('mark-all-read')
  async markAllAsRead(@Query('userId') userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.notificationServiceUrl}/notifications/mark-all-read?userId=${userId}`)
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
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateNotificationDto: Record<string, unknown>) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.notificationServiceUrl}/notifications/${id}`, updateNotificationDto)
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
      this.httpService.delete(`${this.notificationServiceUrl}/notifications/${id}`)
    );
    return response.data;
  }

  // Internal routes for service-to-service communication (no auth required)
  @Post('internal')
  async createInternal(@Body() createNotificationDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/notifications`, createNotificationDto)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error creating notification internally', error);
      throw error;
    }
  }
}