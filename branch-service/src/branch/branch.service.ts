import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    // Check if name already exists
    const existingBranch = await this.branchRepository.findOne({
      where: { name: createBranchDto.name, isRemoved: false },
    });

    if (existingBranch) {
      throw new ConflictException('Branch name already exists');
    }

    const branch = this.branchRepository.create(createBranchDto);
    return await this.branchRepository.save(branch);
  }

  async findAll(): Promise<Branch[]> {
    return await this.branchRepository.find({
      where: { isRemoved: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id, isRemoved: false },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  async findByName(name: string): Promise<Branch | null> {
    return await this.branchRepository.findOne({
      where: { name, isRemoved: false },
    });
  }

  async update(id: number, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);

    // Check name uniqueness if updating name
    if (updateBranchDto.name && updateBranchDto.name !== branch.name) {
      const existingBranch = await this.branchRepository.findOne({
        where: { name: updateBranchDto.name, isRemoved: false },
      });

      if (existingBranch) {
        throw new ConflictException('Branch name already exists');
      }
    }

    Object.assign(branch, updateBranchDto);
    return await this.branchRepository.save(branch);
  }

  async remove(id: number): Promise<void> {
    const branch = await this.findOne(id);
    branch.isRemoved = true;
    await this.branchRepository.save(branch);
  }

  async restore(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id, isRemoved: true },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found in removed records`);
    }

    branch.isRemoved = false;
    return await this.branchRepository.save(branch);
  }
}
