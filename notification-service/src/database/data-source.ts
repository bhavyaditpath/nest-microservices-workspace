import { DataSource } from 'typeorm';
import { Notification } from '../notification/notification.entity';
import { UserNotification } from '../notification/user-notification.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'ips12345',
  database: 'microservices_db',
  entities: [Notification, UserNotification],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});