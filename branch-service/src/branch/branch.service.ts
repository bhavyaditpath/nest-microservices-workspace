import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { NotificationType } from 'shared';
import { Branch } from './branch.entity';
@Injectable()
export class BranchService {
  private readonly branchRepository: Repository<Branch>;
  private readonly notificationServiceUrl: string;

  constructor(
    @InjectRepository(Branch)
    repo: Repository<Branch>,
    private readonly httpService: HttpService,
  ) {
    this.branchRepository = repo;
    this.notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3009';
  }

  async create(createBranchDto: CreateBranchDto) {
    // Check if branch name already exists
    const existingBranch = await this.branchRepository.findOne({ where: { name: createBranchDto.name, isRemoved: false } });
    if (existingBranch) {
      throw new HttpException('Branch name already exists', HttpStatus.BAD_REQUEST);
    }

    const branch = await this.branchRepository.save(this.branchRepository.create(createBranchDto));
    // Create notification for new branch
    await this.createBranchCreationNotification(branch);

    return branch;
  }

  async findAll(page?: number, pageSize?: number, search?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC') {
    const queryBuilder = this.branchRepository.createQueryBuilder('branch');

    // Filter out deleted records
    // queryBuilder.andWhere('branch.isRemoved = :isRemoved', { isRemoved: false });

    // Add search conditions if search term is provided
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      queryBuilder.andWhere(
        'LOWER(branch.name) LIKE :searchTerm',
        { searchTerm }
      );
    }

    // Add dynamic sorting
    const validSortFields = ['name', 'address', 'phone', 'id', 'createdAt', 'updatedAt'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortDirection = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    queryBuilder.orderBy(`branch.${sortField}`, sortDirection);

    if (page && pageSize) {
      // Calculate pagination
      const offset = (page - 1) * pageSize;
      queryBuilder.skip(offset).take(pageSize);

      // Execute query
      const [items, total] = await queryBuilder.getManyAndCount();

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } else {
      // Return all matching items without pagination
      return await queryBuilder.getMany();
    }
  }

  async findOne(id: number) {
    return this.branchRepository.findOne({ where: { id, isRemoved: false } });
  }

  async findByName(name: string): Promise<Branch | null> {
    return this.branchRepository.findOne({ where: { name, isRemoved: false } });
  }

  async update(id: number, updateBranchDto: UpdateBranchDto) {
    // Check if branch name already exists (excluding current branch)
    if (updateBranchDto.name) {
      const existingBranch = await this.branchRepository.findOne({ where: { name: updateBranchDto.name } });
      if (existingBranch && existingBranch.id !== id) {
        throw new HttpException('Branch name already exists', HttpStatus.BAD_REQUEST);
      }
    }
    // Check if trying to deactivate branch and users are assigned
    if (updateBranchDto.isRemoved === true) {
      const userCount = await this.getUserCountByBranch(id);

      if (userCount > 0) {
        throw new HttpException('Cannot deactivate branch: Users are still assigned to this branch', HttpStatus.BAD_REQUEST);
      }
    }

    await this.branchRepository.update(id, updateBranchDto);
    return this.branchRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const branch = await this.findOne(id);
    if (!branch) {
      throw new HttpException('Branch not found', HttpStatus.NOT_FOUND);
    }

    // Check if any users are assigned to this branch
    const userCount = await this.getUserCountByBranch(id);

    if (userCount > 0) {
      throw new HttpException('Cannot delete branch: Users are still assigned to this branch', HttpStatus.BAD_REQUEST);
    }

    await this.branchRepository.update(id, { isRemoved: true });
    return branch;
  }

  private async createBranchCreationNotification(branch: Branch): Promise<void> {
    try {
      const title = 'New Branch Created';
      const message = `A new branch "${branch.name}" has been created at ${branch.address}.`;

      await this.httpService.post(`${this.notificationServiceUrl}/notifications`, {
        title,
        message,
        type: NotificationType.BRANCH,
        branchId: branch.id,
      }).toPromise();
    } catch (error) {
      console.error('Failed to create branch creation notification:', error);
    }
  }

  private async getUserCountByBranch(branchId: number): Promise<number> {
    try {
      const apiGatewayUrl = process.env.USER_SERVICE_URL || 'http://localhost:3004';
      const response = await this.httpService.get(`${apiGatewayUrl}/users/count?branchId=${branchId}`).toPromise();
      if (!response || !response.data) return 0;
      return response.data;
    } catch {
      return 0;
    }
  }
}
