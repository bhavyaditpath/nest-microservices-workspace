import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponseUtil } from 'shared';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.create(createUserDto);
    return ApiResponseUtil.success(data, 'User created successfully');
  }

  @Get()
  async findAll(@Query('branchId') branchId?: string) {
    const data = branchId
      ? await this.userService.findByBranch(parseInt(branchId))
      : await this.userService.findAll();
    return ApiResponseUtil.success(data, 'Users retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.userService.findOne(id);
    return ApiResponseUtil.success(data, 'User retrieved successfully');
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    const data = await this.userService.findByUsername(username);
    return ApiResponseUtil.success(data, 'User retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.userService.update(id, updateUserDto);
    return ApiResponseUtil.success(data, 'User updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return ApiResponseUtil.success(null, 'User deleted successfully');
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    const data = await this.userService.restore(id);
    return ApiResponseUtil.success(data, 'User restored successfully');
  }
}
