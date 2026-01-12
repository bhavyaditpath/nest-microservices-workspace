import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Purchase } from './purchase.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchaseService {
    private readonly branchServiceUrl: string;

    constructor(
        @InjectRepository(Purchase)
        private purchaseRepository: Repository<Purchase>,
        private httpService: HttpService,
    ) {
        this.branchServiceUrl = process.env.BRANCH_SERVICE_URL || 'http://localhost:3003';
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
        // TODO: Uncomment when notification service is available
        // await this.createPurchaseNotifications(savedPurchase, user);

        return savedPurchase;
    }

    async findAll(userId?: number, productName?: string) {
        const query = this.purchaseRepository
            .createQueryBuilder('purchase')
            .where('purchase.isRemoved = :isRemoved', { isRemoved: false });

        if (!productName) {
            query.andWhere("purchase.createdAt >= NOW() - INTERVAL '3 days'");
        }

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

    // TODO: Uncomment when notification service is available
    // private async createPurchaseNotifications(purchase: Purchase, user: User): Promise<void> {
    //   try {
    //     const title = 'New Purchase Added';
    //     const message = `${purchase.productName} (${purchase.brand}) - Quantity: ${purchase.quantity}, Price: ₹${purchase.pricePerUnit}`;

    //     // Create branch-wide notification for all users in the branch
    //     await this.notificationService.create({
    //       title,
    //       message,
    //       type: NotificationType.BRANCH,
    //       branchId: user.branchId,
    //     });

    //     // Create personal notification for the user who made the purchase
    //     const personalTitle = 'Purchase Recorded';
    //     const personalMessage = `Your purchase of ${purchase.productName} (${purchase.brand}) - Quantity: ${purchase.quantity} has been recorded successfully.`;

    //     await this.notificationService.create({
    //       title: personalTitle,
    //       message: personalMessage,
    //       type: NotificationType.USER,
    //       userId: user.id,
    //     });
    //   } catch (error) {
    //     console.error('Failed to create purchase notifications:', error);
    //   }
    // }
}
