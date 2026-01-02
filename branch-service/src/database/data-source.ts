import { DataSource } from 'typeorm';
import { Branch } from '../branch/branch.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'ips12345',
  database: 'microservices_db',
  entities: [Branch],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});