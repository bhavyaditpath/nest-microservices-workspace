import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if username already exists
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username, isRemoved: false },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      where: { isRemoved: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isRemoved: false },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username, isRemoved: false },
    });
  }

  async findByBranch(branchId: number): Promise<User[]> {
    return await this.userRepository.find({
      where: { branchId, isRemoved: false },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check username uniqueness if updating username
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username, isRemoved: false },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.isRemoved = true;
    await this.userRepository.save(user);
  }


  async restore(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isRemoved: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found in removed records`);
    }

    user.isRemoved = false;
    return await this.userRepository.save(user);
  }
}
