import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('branch')
export class BranchController {
  private readonly branchServiceUrl: string;

  constructor(private httpService: HttpService) {
    this.branchServiceUrl = process.env.BRANCH_SERVICE_URL || 'http://localhost:3003';
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createBranchDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.branchServiceUrl}/branches`, createBranchDto)
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
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (pageSize) params.append('pageSize', pageSize);
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    const url = `${this.branchServiceUrl}/branches${params.toString() ? '?' + params.toString() : ''}`;
    const response = await firstValueFrom(
      this.httpService.get(url)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.branchServiceUrl}/branches/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.branchServiceUrl}/branches/name/${name}`)
    );
    return response.data;
  }

  // Internal routes for service-to-service communication (no auth required)
  @Get('internal/name/:name')
  async findByNameInternal(@Param('name') name: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.branchServiceUrl}/branches/name/${name}`)
    );
    return response.data;
  }

  @Get('internal/:id')
  async findOneInternal(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.branchServiceUrl}/branches/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateBranchDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.branchServiceUrl}/branches/${id}`, updateBranchDto)
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
      this.httpService.delete(`${this.branchServiceUrl}/branches/${id}`)
    );
    return response.data;
  }
}