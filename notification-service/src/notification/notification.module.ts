import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { UserNotification } from './user-notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, UserNotification]), HttpModule],
  controllers: [NotificationController],
  providers: [NotificationService]
})
export class NotificationModule {}