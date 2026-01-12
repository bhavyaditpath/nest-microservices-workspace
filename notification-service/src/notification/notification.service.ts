import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Notification } from './notification.entity';
import { UserNotification } from './user-notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationType } from 'shared';
import { NotificationWithRead } from './interfaces/notification-with-read.interface';

@Injectable()
export class NotificationService {
  private readonly userServiceUrl: string;

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(UserNotification)
    private userNotificationRepository: Repository<UserNotification>,
    private httpService: HttpService,
  ) {
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
  }

  async create(createDto: CreateNotificationDto): Promise<Notification> {
    // Validate that either userId or branchId is provided
    if (!createDto.userId && !createDto.branchId) {
      throw new Error('Either userId or branchId must be provided');
    }

    const notification = this.notificationRepository.create(createDto);
    const saved = await this.notificationRepository.save(notification);

    let users: any[] = [];

    if (createDto.userId) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${this.userServiceUrl}/users/${createDto.userId}`)
        );
        const userData = response.data;
        if (userData.success && userData.data) {
          users = [userData.data];
        } else {
          throw new Error(`User with ID ${createDto.userId} not found`);
        }
      } catch (error) {
        throw new Error(`User with ID ${createDto.userId} not found`);
      }
    } else if (createDto.branchId) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${this.userServiceUrl}/users/by-branch/${createDto.branchId}`)
        );
        users = response.data || [];
        if (users.length === 0) {
          throw new Error(`No users found in branch with ID ${createDto.branchId}`);
        }
      } catch (error) {
        throw new Error(`No users found in branch with ID ${createDto.branchId}`);
      }
    }

    const userNotifications = users.map(user =>
      this.userNotificationRepository.create({
        userId: user.id,
        notificationId: saved.id,
        read: false,
      }),
    );

    await this.userNotificationRepository.save(userNotifications);
    return saved;
  }

  async findAll(type?: NotificationType, page: number = 1, limit: number = 10): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('(notification.isRemoved = false OR notification.isRemoved IS NULL)');

    if (type) {
      query.andWhere('notification.type = :type', { type });
    }

    query.orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async findAllWithReadStatus(
    type?: NotificationType,
    page: number = 1,
    limit: number = 10,
    userId?: number
  ): Promise<{ data: NotificationWithRead[]; total: number; page: number; limit: number }> {
    if (!userId) {
      // If no userId provided, fall back to regular findAll
      return this.findAll(type, page, limit) as any;
    }

    const query = this.userNotificationRepository
      .createQueryBuilder('un')
      .innerJoinAndSelect('un.notification', 'n')
      .where('un.userId = :userId', { userId })
      .andWhere('(n.isRemoved = false OR n.isRemoved IS NULL)');

    if (type) {
      query.andWhere('n.type = :type', { type });
    }

    query.orderBy('n.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data: data.map(x => ({
        ...x.notification,
        read: x.read,
      })) as NotificationWithRead[],
      total,
      page,
      limit,
    };
  }

  async findLatest(limit: number = 5, userId?: number): Promise<{ data: NotificationWithRead[]; total: number; page: number; limit: number }> {
    if (!userId) {
      // Get latest notifications for all users (add default read: false)
      const [data, total] = await this.notificationRepository.findAndCount({
        where: { isRemoved: false },
        order: { createdAt: 'DESC' },
        take: limit,
      });

      // Add default read: false for notifications without user context
      const dataWithRead = data.map(notification => ({
        ...notification,
        read: false,
      })) as NotificationWithRead[];

      return { data: dataWithRead, total, page: 1, limit };
    }

    // Get latest notifications for specific user (with read status)
    const query = this.userNotificationRepository
      .createQueryBuilder('un')
      .innerJoinAndSelect('un.notification', 'n')
      .where('un.userId = :userId', { userId })
      .andWhere('(n.isRemoved = false OR n.isRemoved IS NULL)')
      .orderBy('n.createdAt', 'DESC')
      .take(limit);

    const result = await query.getMany();
    const data = result.map(x => ({
      ...x.notification,
      read: x.read,
    })) as NotificationWithRead[];
    const total = result.length;

    return { data, total, page: 1, limit };
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, isRemoved: false },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async findByUser(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<{ data: NotificationWithRead[]; total: number; page: number; limit: number }> {
    const query = this.userNotificationRepository
      .createQueryBuilder('un')
      .innerJoinAndSelect('un.notification', 'n')
      .where('un.userId = :userId', { userId })
      .andWhere('(n.isRemoved = false OR n.isRemoved IS NULL)')
      .orderBy('n.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data: data.map(x => ({
        ...x.notification,
        read: x.read,
      })) as NotificationWithRead[],
      total,
      page,
      limit,
    };
  }

  async findByBranch(branchId: number, page: number = 1, limit: number = 10): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.branchId = :branchId', { branchId })
      .andWhere('(notification.isRemoved = false OR notification.isRemoved IS NULL)');

    query.orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async getUnreadCount(userId: number) {
    const unreadCount = await this.userNotificationRepository.count({
      where: {
        userId,
        read: false,
      },
    });
    return { unreadCount };
  }

  async markAsRead(notificationId: number, userId: number) {
    // First check if the notification exists and is not removed
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, isRemoved: false },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found or has been deleted');
    }

    const userNotification = await this.userNotificationRepository.findOne({
      where: { notificationId, userId },
    });

    if (!userNotification) {
      // This could mean:
      // 1. User was not part of the notification target audience
      // 2. Notification was created after user was removed from branch
      // 3. Database inconsistency
      throw new NotFoundException('Notification not found for user');
    }

    userNotification.read = true;
    return this.userNotificationRepository.save(userNotification);
  }

  async markAllAsRead(userId: number) {
    // Only mark as read notifications that are still valid (notification not removed)
    await this.userNotificationRepository
      .createQueryBuilder()
      .update(UserNotification)
      .set({ read: true })
      .where('userId = :userId', { userId })
      .andWhere('read = :read', { read: false })
      .andWhere('notificationId IN (SELECT id FROM notifications WHERE isRemoved = false OR isRemoved IS NULL)')
      .execute();

    return { success: true };
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    notification.isRemoved = true;
    await this.notificationRepository.save(notification);
  }
}