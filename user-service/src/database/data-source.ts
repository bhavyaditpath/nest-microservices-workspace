import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'ips12345',
  database: 'microservices_db',
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});