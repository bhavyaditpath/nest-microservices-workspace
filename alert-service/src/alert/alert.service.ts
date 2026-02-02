import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { StockAlert } from './alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { ResolveAlertDto } from './dto/resolve-alert.dto';
import { DismissAlertDto } from './dto/dismiss-alert.dto';
import { AlertPriority, AlertStatus, AlertType } from 'shared';
import { NotificationType } from 'shared';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(StockAlert)
    private alertRepository: Repository<StockAlert>,
    private httpService: HttpService,
  ) { }

  async create(createAlertDto: CreateAlertDto): Promise<StockAlert> {
    if (!createAlertDto.priority) {
      createAlertDto.priority = this.calculatePriority(
        createAlertDto.shortage,
        createAlertDto.minStock,
      );
    }

    const alert = this.alertRepository.create(createAlertDto);
    const savedAlert = await this.alertRepository.save(alert);
    // Create notifications for the alert
    await this.createAlertNotifications(savedAlert);
    return savedAlert;
  }

  async findByBranch(
    branchId: number,
    status?: AlertStatus,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: StockAlert[]; total: number; page: number; limit: number }> {
    const query = this.alertRepository
      .createQueryBuilder('alert')
      .where('alert.branchId = :branchId', { branchId })
      .andWhere('(alert.isRemoved = false OR alert.isRemoved IS NULL)');

    if (status) query.andWhere('alert.status = :status', { status });

    query.orderBy('alert.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<StockAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id, isRemoved: false },
    });
    if (!alert) throw new NotFoundException('Alert not found');
    return alert;
  }

  async findExistingAnyStatusAlert(
    itemName: string,
    brand: string,
    branchId: number,
    alertType: AlertType,
  ): Promise<StockAlert | null> {
    return this.alertRepository.findOne({
      where: {
        itemName: `${itemName} (${brand})`,
        branchId,
        alertType,
        isRemoved: false,
      },
    });
  }

  async generateAlertsForBranch(branchId: number): Promise<void> {
    try {
      const response = await this.httpService
        .get(`http://localhost:3006/purchases/inventory/${branchId}`)
        .toPromise();

      if (!response?.data?.data || !Array.isArray(response.data.data)) {
        return;
      }

      const inventoryData = response.data.data;

      for (const item of inventoryData) {
        const currentStock = Number(item.currentstock);
        const minStock = Number(item.minstock);
        const productName = item.productname;
        const brand = item.brand;

        const alertType =
          currentStock <= 0
            ? AlertType.OUT_OF_STOCK
            : AlertType.LOW_STOCK;

        const existingAlert = await this.findExistingAnyStatusAlert(
          productName,
          brand,
          branchId,
          alertType,
        );

        if (
          existingAlert &&
          (existingAlert.status === AlertStatus.DISMISSED ||
            existingAlert.status === AlertStatus.RESOLVED)
        ) {
          continue;
        }

        if (currentStock <= minStock) {
          const shortage = minStock - currentStock;

          if (existingAlert) {
            if (existingAlert.status === AlertStatus.ACTIVE) {
              existingAlert.currentStock = currentStock;
              existingAlert.shortage = shortage;
              existingAlert.priority = this.calculatePriority(shortage, minStock);

              await this.alertRepository.save(existingAlert);
            }
          } else {
            await this.create({
              itemName: `${productName} (${brand})`,
              currentStock,
              minStock,
              shortage,
              alertType,
              branchId,
            });
          }
        } else {
          if (existingAlert && existingAlert.status === AlertStatus.ACTIVE) {
            existingAlert.status = AlertStatus.RESOLVED;
            existingAlert.resolvedDate = new Date();

            await this.alertRepository.save(existingAlert);
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate alerts for branch:', error);
    }
  }

  async resolve(id: number, dto: ResolveAlertDto): Promise<StockAlert> {
    const alert = await this.findOne(id);
    alert.status = AlertStatus.RESOLVED;
    alert.resolvedDate = new Date();
    if (dto.notes) alert.notes = dto.notes;
    const resolvedAlert = await this.alertRepository.save(alert);
    // Create notification for alert resolution
    await this.createAlertStatusNotification(resolvedAlert, 'resolved');
    return resolvedAlert;
  }

  async dismiss(id: number, dto?: DismissAlertDto): Promise<StockAlert> {
    const alert = await this.findOne(id);
    alert.status = AlertStatus.DISMISSED;
    if (dto?.notes) alert.notes = dto.notes;
    const dismissedAlert = await this.alertRepository.save(alert);
    // Create notification for alert dismissal
    await this.createAlertStatusNotification(dismissedAlert, 'dismissed');
    return dismissedAlert;
  }

  async update(id: number, updateDto: UpdateAlertDto): Promise<StockAlert> {
    const alert = await this.findOne(id);
    Object.assign(alert, updateDto);
    return this.alertRepository.save(alert);
  }

  async remove(id: number): Promise<void> {
    const alert = await this.findOne(id);
    alert.isRemoved = true;
    await this.alertRepository.save(alert);
  }

  private calculatePriority(shortage: number, minStock: number): AlertPriority {
    const percentage = shortage / minStock;
    if (percentage > 0.5) return AlertPriority.CRITICAL;
    if (percentage > 0.25) return AlertPriority.HIGH;
    if (percentage > 0.1) return AlertPriority.MEDIUM;
    return AlertPriority.LOW;
  }

  async updateProductAlert(
    itemName: string,
    brand: string,
    branchId: number,
    currentStock: number,
    minStock: number
  ) {
    const alertType =
      currentStock <= 0 ? AlertType.OUT_OF_STOCK : AlertType.LOW_STOCK;

    // First resolve any other active alerts for this product
    const activeAlerts = await this.alertRepository.find({
      where: {
        itemName: `${itemName} (${brand})`,
        branchId,
        status: AlertStatus.ACTIVE,
      },
    });

    for (const a of activeAlerts) {
      // If stock is healthy, resolve all active alerts
      if (currentStock > minStock) {
        a.status = AlertStatus.RESOLVED;
        a.resolvedDate = new Date();
        await this.alertRepository.save(a);
      }
    }

    // If stock is healthy, no need to create new alerts
    if (currentStock > minStock) return;

    // Check if alert of this type already exists
    const existing = await this.alertRepository.findOne({
      where: {
        itemName: `${itemName} (${brand})`,
        branchId,
        alertType,
        status: AlertStatus.ACTIVE,
      },
    });

    if (existing) {
      existing.currentStock = currentStock;
      existing.shortage = Math.max(0, minStock - currentStock);
      existing.priority = this.calculatePriority(existing.shortage, minStock);
      await this.alertRepository.save(existing);
      return;
    }

    await this.create({
      itemName: `${itemName} (${brand})`,
      currentStock,
      minStock,
      shortage: Math.max(0, minStock - currentStock),
      alertType,
      branchId,
    });
  }

  private async createAlertNotifications(alert: StockAlert): Promise<void> {
    try {
      const title = alert.alertType === AlertType.OUT_OF_STOCK ? 'Out of Stock Alert' : 'Low Stock Alert';
      const message = `${alert.itemName} - Current stock: ${alert.currentStock}, Shortage: ${alert.shortage}`;

      // Create branch-wide notification for all users in the branch
      await this.httpService.post('http://localhost:3009/notifications', {
        title,
        message,
        type: NotificationType.BRANCH,
        branchId: alert.branchId,
      }).toPromise();

      // Note: For alerts, we don't create personal USER notifications since they are system-generated
      // and not triggered by a specific user action
    } catch (error) {
      console.error('Failed to create alert notifications:', error);
    }
  }

  private async createAlertStatusNotification(alert: StockAlert, action: 'resolved' | 'dismissed'): Promise<void> {
    try {
      const title = action === 'resolved' ? 'Alert Resolved' : 'Alert Dismissed';
      const actionText = action === 'resolved' ? 'resolved' : 'dismissed';
      const message = `${alert.itemName} alert has been ${actionText}.`;

      await this.httpService.post('http://localhost:3009/notifications', {
        title,
        message,
        type: NotificationType.BRANCH,
        branchId: alert.branchId,
      }).toPromise();
    } catch (error) {
      console.error(`Failed to create alert ${action} notification:`, error);
    }
  }
}
