import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('branch')
export class BranchController {
  constructor(private httpService: HttpService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createBranchDto: any) {
    const response = await firstValueFrom(
      this.httpService.post('http://localhost:3003/branches', createBranchDto)
    );
    return response.data;
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

    const url = `http://localhost:3003/branches${params.toString() ? '?' + params.toString() : ''}`;
    const response = await firstValueFrom(
      this.httpService.get(url)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.get(`http://localhost:3003/branches/${id}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    const response = await firstValueFrom(
      this.httpService.get(`http://localhost:3003/branches/name/${name}`)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateBranchDto: any) {
    const response = await firstValueFrom(
      this.httpService.patch(`http://localhost:3003/branches/${id}`, updateBranchDto)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.httpService.delete(`http://localhost:3003/branches/${id}`)
    );
    return response.data;
  }
}