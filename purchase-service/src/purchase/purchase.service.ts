import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Purchase } from './purchase.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { NotificationType } from 'shared';

@Injectable()
export class PurchaseService {
  private readonly branchServiceUrl: string;
  private readonly notificationServiceUrl: string;

  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    private httpService: HttpService,
  ) {
    this.branchServiceUrl = process.env.BRANCH_SERVICE_URL || 'http://localhost:3003';
    this.notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3009';
  }

  async findDuplicate(productName: string, userId: number) {
    return this.purchaseRepository.findOne({
      where: {
        productName,
        userId,
        isRemoved: false,
      },
    });
  }

  async create(createPurchaseDto: CreatePurchaseDto) {
    const purchase = this.purchaseRepository.create({
      ...createPurchaseDto,
      createdBy: createPurchaseDto.userId,
    });

    const savedPurchase = await this.purchaseRepository.save(purchase);

    // TODO: Uncomment when alert service is available
    // if (createPurchaseDto.branchId) {
    //   await this.alertService.generateAlertsForBranch(createPurchaseDto.branchId);
    // }
    await this.createPurchaseNotifications(savedPurchase, createPurchaseDto);

    return savedPurchase;
  }

  async findAll(userId?: number, productName?: string) {
    const query = this.purchaseRepository
      .createQueryBuilder('purchase')
      .where('purchase.isRemoved = :isRemoved', { isRemoved: false });

    // if (!productName) {
    //     query.andWhere("purchase.createdAt >= NOW() - INTERVAL '3 days'");
    // }

    if (userId) {
      query.andWhere('purchase.userId = :userId', { userId });
    }

    if (productName) {
      query.andWhere('purchase.productName = :productName', { productName });
    }

    const purchases = await query.getMany();

    // Enrich purchases with branch data
    const enrichedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        let branch: { id: number; name: string } | null = null;
        if (purchase.branchId) {
          try {
            const response = await firstValueFrom(
              this.httpService.get(`${this.branchServiceUrl}/branches/${purchase.branchId}`)
            );
            const branchData = response.data.data || response.data;
            if (branchData) {
              branch = { id: branchData.id, name: branchData.name };
            }
          } catch (error) {
            console.error(`Failed to fetch branch ${purchase.branchId}:`, error.message);
            branch = null;
          }
        }

        return {
          ...purchase,
          branch,
        };
      })
    );

    return enrichedPurchases;
  }

  async findOne(id: number) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id, isRemoved: false },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return purchase;
  }

  async update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    const purchase = await this.findOne(id);

    Object.assign(purchase, updatePurchaseDto);
    const updated = await this.purchaseRepository.save(purchase);

    // TODO: Uncomment when alert service is available
    // if (purchase.branchId) {
    //   await this.alertService.generateAlertsForBranch(purchase.branchId);
    // }

    return updated;
  }

  async remove(id: number) {
    const purchase = await this.findOne(id);
    purchase.isRemoved = true;
    return this.purchaseRepository.save(purchase);
  }

  async getReportSummary(startDate: string, endDate: string, userId?: number) {
    let query = this.purchaseRepository
      .createQueryBuilder('purchase')
      // .leftJoin('purchase.user', 'user')
      .select([
        'COUNT(purchase.id) AS "totalPurchases"',
        'SUM(purchase.quantity) AS "totalQuantity"',
        'SUM(purchase.totalPrice) AS "totalPrice"',
        'AVG(purchase.totalPrice) AS "averagePrice"',
      ])
      .where('purchase.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('purchase.isRemoved = :isRemoved', { isRemoved: false });

    if (userId) {
      query = query.andWhere('purchase.userId = :userId', { userId });
    }

    const result = await query.getRawOne();

    // Handle case where no purchases exist for the period
    if (!result) {
      return {
        period: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        summary: {
          totalPurchases: 0,
          totalQuantity: 0,
          totalPrice: 0,
          averagePrice: 0,
        },
      };
    }

    return {
      period: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      summary: {
        totalPurchases: Number(result.totalPurchases ?? 0),
        totalQuantity: Number(result.totalQuantity ?? 0),
        totalPrice: Number(result.totalPrice ?? 0),
        averagePrice: Number(result.averagePrice ?? 0),

      },
    };
  }

  private async createPurchaseNotifications(purchase: Purchase, createPurchaseDto: CreatePurchaseDto): Promise<void> {
    try {
      const title = 'New Purchase Added';
      const message = `${purchase.productName} (${purchase.brand}) - Quantity: ${purchase.quantity}, Price: ₹${purchase.pricePerUnit}`;

      // Create branch-wide notification for all users in the branch
      await firstValueFrom(this.httpService.post(`${this.notificationServiceUrl}/notifications`, {
        title,
        message,
        type: NotificationType.BRANCH,
        branchId: createPurchaseDto.branchId,
      }));

      // Create personal notification for the user who made the purchase
      const personalTitle = 'Purchase Recorded';
      const personalMessage = `Your purchase of ${purchase.productName} (${purchase.brand}) - Quantity: ${purchase.quantity} has been recorded successfully.`;

      await firstValueFrom(this.httpService.post(`${this.notificationServiceUrl}/notifications`, {
        title: personalTitle,
        message: personalMessage,
        type: NotificationType.USER,
        userId: createPurchaseDto.userId,
      }));
    } catch (error) {
      console.error('Failed to create purchase notifications:', error);
    }
  }
}
