import { DataSource } from 'typeorm';
import { StockAlert } from '../alert/entities/alert.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'alert_service',
  synchronize: false,
  logging: false,
  entities: [StockAlert],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
});