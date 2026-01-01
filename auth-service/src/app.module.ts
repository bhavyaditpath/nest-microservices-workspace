import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      synchronize: false, // ⚠️ DEV ONLY
    }),
  ],
})
export class AppModule {}
