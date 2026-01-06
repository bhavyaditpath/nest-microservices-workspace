import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { ApiResponseUtil } from 'shared';

@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  async create(@Body() createBranchDto: CreateBranchDto) {
    const data = await this.branchService.create(createBranchDto);
    return ApiResponseUtil.success(data, 'Branch created successfully');
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const data = await this.branchService.findAll(
      page ? parseInt(page) : undefined,
      pageSize ? parseInt(pageSize) : undefined,
      search,
      sortBy,
      sortOrder as 'ASC' | 'DESC' | undefined,
    );
    return ApiResponseUtil.success(data, 'Branches retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.branchService.findOne(id);
    return ApiResponseUtil.success(data, 'Branch retrieved successfully');
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    const data = await this.branchService.findByName(name);
    return ApiResponseUtil.success(data, 'Branch retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    const data = await this.branchService.update(id, updateBranchDto);
    return ApiResponseUtil.success(data, 'Branch updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.branchService.remove(id);
    return ApiResponseUtil.success(null, 'Branch deleted successfully');
  }
}
