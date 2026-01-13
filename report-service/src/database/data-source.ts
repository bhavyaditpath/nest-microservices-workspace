import { ReportPreference } from 'src/report/entities/report-preference.entity';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'ips12345',
  database: 'microservices_db',
  entities: [ReportPreference],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: true,
});