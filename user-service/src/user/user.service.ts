import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { User } from './user.entity';
import { HashUtil, NotificationType, ApiResponse, ApiResponseUtil } from 'shared';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private readonly userRepository: Repository<User>;

  constructor(
    @InjectRepository(User)
    repo: Repository<User>,
    private readonly httpService: HttpService,
  ) {
    this.userRepository = repo;
  }

  async create(userDto: CreateUserDto): Promise<ApiResponse> {
    const { username, password, role, branchName } = userDto;

    // Find branch
    const branchResponse = await this.httpService.get(`http://localhost:3003/branches/name/${branchName}`).toPromise();
    if (!branchResponse || !branchResponse.data || !branchResponse.data.success) {
      return ApiResponseUtil.error('Branch not found');
    }
    const branch = branchResponse.data.data;
    if (!branch) {
      return ApiResponseUtil.error('Branch not found');
    }

    // Check unique username inside SAME branch (only active users)
    const existingUser = await this.userRepository.findOne({
      where: {
        username,
        branchId: branch.id,
        isRemoved: false
      }
    });

    if (existingUser) {
      return ApiResponseUtil.error('Username already exists in this branch');
    }

    // Hash password
    const hashedPassword = await HashUtil.hash(password!);

    const user = await this.userRepository.save(this.userRepository.create({
      username,
      password: hashedPassword,
      role,
      branchId: branch.id,
      isRemoved: false,
    }));

    await this.createUserRegistrationNotification(user, branch.name);

    return ApiResponseUtil.success(user, 'User created successfully');
  }

  async findAll(page?: number, pageSize?: number, search?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC') {
    if (page && pageSize) {
      return this.searchUsersWithPagination(page, pageSize, search, sortBy, sortOrder);
    }

    return this.userRepository.find();
  }

  private async searchUsersWithPagination(
    page: number,
    pageSize: number,
    search?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC'
  ): Promise<ApiResponse> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .andWhere('user.isRemoved = :isRemoved', { isRemoved: false });

    // Add search conditions if search term is provided
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      queryBuilder.andWhere(
        `(LOWER(user.username) LIKE :searchTerm)`,
        { searchTerm }
      );
    }

    // Add dynamic sorting
    const validSortFields = ['username', 'role', 'branchId', 'id', 'createdAt', 'updatedAt'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'username';
    const sortDirection = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    queryBuilder.orderBy(`user.${sortField}`, sortDirection);

    // Calculate pagination
    const offset = (page - 1) * pageSize;
    queryBuilder.skip(offset).take(pageSize);

    // Execute query
    const [items, total] = await queryBuilder.getManyAndCount();

    // Transform the data to include only branch name instead of full branch object
    const transformedUsers = await Promise.all(items.map(async user => ({
      ...user,
      branch: await this.getBranchName(user.branchId),
      role: user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
    })));

    return ApiResponseUtil.success({
      items: transformedUsers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  }

  async findOne(id: number): Promise<ApiResponse> {
    const user = await this.userRepository.findOne({ where: { id, isRemoved: false } });

    if (!user) {
      return ApiResponseUtil.error('User not found');
    }

    // Transform the data to include only branch name instead of full branch object
    const branchName = await this.getBranchName(user.branchId);
    const transformedUser = {
      ...user,
      branch: branchName,
      role: user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
    };

    return ApiResponseUtil.success(transformedUser, 'User found');
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async countUsersByBranch(branchId: number): Promise<number> {
    return this.userRepository.count({ where: { branchId, isRemoved: false } });
  }

  async update(id: number, userDto: UpdateUserDto): Promise<ApiResponse> {
    const user = await this.userRepository.findOne({ where: { id, isRemoved: false } });

    if (!user) {
      return ApiResponseUtil.error('User not found');
    }

    // Determine branch (existing or updated)
    let branchId = user.branchId;

    if (userDto.branchName) {
      const branchResponse = await this.httpService.get(`http://localhost:3003/branches/name/${userDto.branchName}`).toPromise();
      if (!branchResponse || !branchResponse.data || !branchResponse.data.success) {
        return ApiResponseUtil.error('Branch not found');
      }
      const branch = branchResponse.data.data;
      if (!branch) {
        return ApiResponseUtil.error('Branch not found');
      }
      branchId = branch.id;
    }

    // Check username uniqueness in same branch (exclude removed users)
    if (userDto.username) {
      const existingUser = await this.userRepository.findOne({
        where: {
          username: userDto.username,
          branchId: branchId,
          isRemoved: false
        }
      });

      if (existingUser && existingUser.id !== id) {
        return ApiResponseUtil.error('Username already exists in this branch');
      }
    }

    // Hash password if changed
    if (userDto.password) {
      userDto.password = await HashUtil.hash(userDto.password);
    }

    // Prepare update data with only entity properties
    const updateData = {
      username: userDto.username,
      password: userDto.password,
      role: userDto.role,
      branchId,
    };

    console.log('Update data being passed to repository:', updateData);

    // Apply updates
    await this.userRepository.update(id, updateData);
    const updatedUser = await this.userRepository.findOne({ where: { id } });

    return ApiResponseUtil.success(updatedUser, 'User updated successfully');
  }

  async remove(id: number): Promise<ApiResponse> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return ApiResponseUtil.error('User not found');
    }

    await this.userRepository.update(id, { isRemoved: true });
    return ApiResponseUtil.success(user, 'User deleted successfully');
  }

  private async createUserRegistrationNotification(user: User, branchName: string): Promise<void> {
    try {
      const title = 'Welcome to Electric Inventory';
      const message = `New user ${user.username} has been registered in branch ${branchName}.`;

      // await this.httpService.post('http://localhost:3003/notification', {
      //   title,
      //   message,
      //   type: NotificationType.BRANCH,
      //   branchId: user.branchId,
      // }).toPromise();
    } catch (error) {
      console.error('Failed to create user registration notification:', error);
    }
  }

  private async getBranchName(branchId: number): Promise<string | null> {
    try {
      const response = await this.httpService.get(`http://localhost:3003/branches/${branchId}`).toPromise();
      if (!response || !response.data || !response.data.success) return null;
      return response.data.data?.name || null;
    } catch {
      return null;
    }
  }
}
