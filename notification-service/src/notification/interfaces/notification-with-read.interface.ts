import { Notification } from '../notification.entity';

export interface NotificationWithRead extends Notification {
  read: boolean;
}