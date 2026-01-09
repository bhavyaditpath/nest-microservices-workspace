import { DataSource } from 'typeorm';
import { Request } from '../request/request.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'ips12345',
  database: 'microservices_db',
  entities: [Request],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});