import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RequestController } from './request.controller';

@Module({
  imports: [HttpModule],
  controllers: [RequestController],
})
export class RequestModule {}