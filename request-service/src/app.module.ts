import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestModule } from './request/request.module';

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
    RequestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}