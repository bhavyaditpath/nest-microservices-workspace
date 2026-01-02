import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
