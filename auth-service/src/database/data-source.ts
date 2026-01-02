import { DataSource } from 'typeorm';
import { UserAuth } from '../auth/user-auth.entity';
import { RefreshToken } from '../auth/refresh-token.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'ips12345',
  database: 'microservices_db',
  entities: [UserAuth, RefreshToken],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});