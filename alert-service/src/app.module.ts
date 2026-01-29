import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AlertModule } from './alert/alert.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'ips12345',
      database: 'microservices_db',
      autoLoadEntities: true,
      synchronize: false,
    }),
    HttpModule,
    AlertModule,
  ],
})
export class AppModule {}
