import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { ApiResponseUtil } from 'shared/src/common/api-response.util';

@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  async create(@Body() createBranchDto: CreateBranchDto) {
    const data = await this.branchService.create(createBranchDto);
    return ApiResponseUtil.success(data, 'Branch created successfully');
  }

  @Get()
  async findAll() {
    const data = await this.branchService.findAll();
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

  @Patch(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    const data = await this.branchService.restore(id);
    return ApiResponseUtil.success(data, 'Branch restored successfully');
  }
}
