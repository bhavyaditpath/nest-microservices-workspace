import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotificationController } from './notification.controller';

@Module({
  imports: [HttpModule],
  controllers: [NotificationController],
})
export class NotificationModule {}