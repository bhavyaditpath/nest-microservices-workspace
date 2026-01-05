import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';

export class GenericRepository<T> {
  constructor(private readonly repo: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findAll(): Promise<T[]> {
    return this.repo.find();
  }

  async findOne(conditions: FindOptionsWhere<T>): Promise<T | null> {
    return this.repo.findOne({ where: conditions });
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    await this.repo.update(id, data as any);
    return this.findOne({ id } as unknown as FindOptionsWhere<T>);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.repo.update(id, { isRemoved: true } as any);
  }

  withNoDeletedRecord() {
    return {
      findOne: (conditions: FindOptionsWhere<T>) => {
        return this.repo.findOne({
          where: { ...conditions, isRemoved: false } as unknown as FindOptionsWhere<T>
        });
      }
    };
  }
}