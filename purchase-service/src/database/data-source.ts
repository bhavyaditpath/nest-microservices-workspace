import { DataSource } from 'typeorm';
import { Purchase } from '../purchase/purchase.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'ips12345',
  database: 'microservices_db',
  entities: [Purchase],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});