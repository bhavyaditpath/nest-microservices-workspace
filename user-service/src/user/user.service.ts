import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { HashUtil } from 'shared';
import { NotificationType } from 'shared';
import { ApiResponse, ApiResponseUtil } from 'shared';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        // private readonly notificationService: NotificationService,
    ) { }

    async create(userDto: CreateUserDto): Promise<ApiResponse> {
        const { username, password, role, branchId } = userDto;

        // Find branch
        // const branch = await this.branchService.findByName(branchName);
        // if (!branch) {
        //   return ApiResponseUtil.error('Branch not found');
        // }

        // Check unique username inside SAME branch (only active users)
        const existingUser = await this.userRepository.findOne({
            where: {
                username,
                isRemoved: false,
                branchId: branchId
            }
        });

        if (existingUser) {
            return ApiResponseUtil.error('Username already exists');
        }

        // Hash password
        const hashedPassword = await HashUtil.hash(password!);

        const user = this.userRepository.create({
            username,
            password: hashedPassword,
            role,
            branchId: branchId,
            isRemoved: false,
        });
        await this.userRepository.save(user);

        // await this.createUserRegistrationNotification(user, branch.name);

        return ApiResponseUtil.success(user, 'User created successfully');
    }

    async findAll(page?: number, pageSize?: number, search?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC') {
        if (page && pageSize) {
            return this.searchUsersWithPagination(page, pageSize, search, sortBy, sortOrder);
        }

        return this.userRepository.find({ where: { isRemoved: false } });
    }

    private async searchUsersWithPagination(
        page: number,
        pageSize: number,
        search?: string,
        sortBy?: string,
        sortOrder?: 'ASC' | 'DESC'
    ): Promise<ApiResponse> {
        const queryBuilder = this.userRepository['repo']
            .createQueryBuilder('user')
            // .leftJoinAndSelect('user.branch', 'branch')
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
        const transformedUsers = items.map(user => ({
            ...user,
            // branch: user.branch ? user.branch.name : null,
            role: user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
        }));

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
        const transformedUser = {
            ...user,
            branch: user.branchId,
            role: user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
        };

        return ApiResponseUtil.success(transformedUser, 'User found');
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { username } });
    }

    async update(id: number, userDto: UpdateUserDto): Promise<ApiResponse> {
        const user = await this.userRepository.findOne({ where: { id, isRemoved: false } });

        if (!user) {
            return ApiResponseUtil.error('User not found');
        }

        // Determine branch (existing or updated)
        let branchId = user.branchId;

        // if (userDto.branchName) {
        //   const branch = await this.branchService.findByName(userDto.branchName);
        //   if (!branch) return ApiResponseUtil.error('Branch not found');
        //   branchId = branch.id;
        // }

        // Check username uniqueness in same branch (exclude removed users)
        if (userDto.username) {
            const existingUser = await this.userRepository.findOne({
                where: {
                    username: userDto.username,
                    isRemoved: false,
                    branchId: branchId
                }
            });

            if (existingUser && existingUser.id !== id) {
                return ApiResponseUtil.error('Username already exists');
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
        Object.assign(user, updateData);
        const updatedUser = await this.userRepository.save(user);

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

            // await this.notificationService.create({
            //   title,
            //   message,
            //   type: NotificationType.BRANCH,
            //   branchId: user.branchId,
            // });
        } catch (error) {
            console.error('Failed to create user registration notification:', error);
        }
    }
}
