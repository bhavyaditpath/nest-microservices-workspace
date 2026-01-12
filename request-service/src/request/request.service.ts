import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './request.entity';
import { UserRole, RequestStatus, ApiResponseUtil, User, PurchaseData, NotificationType } from 'shared';

@Injectable()
export class RequestService {
  private readonly userServiceUrl: string;
  private readonly purchaseServiceUrl: string;
  private readonly notificationServiceUrl: string;

  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    private httpService: HttpService,
  ) {
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3004';
    this.purchaseServiceUrl = process.env.PURCHASE_SERVICE_URL || 'http://localhost:3006';
    this.notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3009';
  }

  async create(createRequestDto: CreateRequestDto, requestingUser: User) {
    // Fetch admin user via HTTP
    try {
      const adminResponse = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/${createRequestDto.adminUserId}`)
      );
      const adminUser = adminResponse.data.data || adminResponse.data;
      if (!adminUser || adminUser.role !== UserRole.ADMIN) {
        return ApiResponseUtil.error('Invalid admin user');
      }
    } catch (error) {
      return ApiResponseUtil.error('Failed to validate admin user');
    }

    if (requestingUser.role !== UserRole.BRANCH) {
      return ApiResponseUtil.error('Only branch users can create requests');
    }

    const request = this.requestRepository.create({
      ...createRequestDto,
      requestingUserId: requestingUser.id,
      status: RequestStatus.REQUEST,
    });

    const saved = await this.requestRepository.save(request);

    await this.createRequestCreationNotifications(saved, requestingUser);

    return ApiResponseUtil.success(saved, 'Request created successfully');
  }

  async findAll(user: User, params?: any) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const query = this.requestRepository
      .createQueryBuilder('request')
      .where('request.isRemoved = :removed', { removed: false });

    if (user.role === UserRole.ADMIN) {
      query.andWhere('request.adminUserId = :id', { id: user.id });
    } else if (user.role === UserRole.BRANCH) {
      query.andWhere('request.requestingUserId = :id', { id: user.id });
    }

    // Search functionality
    if (params?.search) {
      const searchTerm = `%${params.search.trim().toLowerCase()}%`;
      query.andWhere(
        `(LOWER(CAST(request.status AS TEXT)) LIKE :search
      OR LOWER(request.notes) LIKE :search)`,
        { search: searchTerm }
      );
      // Note: Removed purchase.productName search as purchase is not joined
    }

    // Sorting functionality
    const allowedSortFields = ['createdAt', 'updatedAt', 'status', 'quantityRequested'];
    if (params?.sortBy && allowedSortFields.includes(params.sortBy)) {
      query.orderBy(`request.${params.sortBy}`, params.sortOrder || 'ASC');
    } else {
      query.orderBy('request.createdAt', 'DESC');
    }

    const offset = (page - 1) * pageSize;
    query.skip(offset).take(pageSize);

    const [items, total] = await query.getManyAndCount();

    // Enrich with user and purchase data
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        let requestingUser: any = null;
        let adminUser: any = null;
        let purchase: any = null;

        try {
          const reqUserRes = await firstValueFrom(
            this.httpService.get(`${this.userServiceUrl}/users/${item.requestingUserId}`)
          );
          requestingUser = reqUserRes.data.data || reqUserRes.data;
        } catch (e) { }

        try {
          const adminUserRes = await firstValueFrom(
            this.httpService.get(`${this.userServiceUrl}/users/${item.adminUserId}`)
          );
          adminUser = adminUserRes.data.data || adminUserRes.data;
        } catch (e) { }

        try {
          const purchaseRes = await firstValueFrom(
            this.httpService.get(`${this.purchaseServiceUrl}/purchases/${item.purchaseId}`)
          );
          purchase = purchaseRes.data.data || purchaseRes.data;
        } catch (e) { }

        return {
          ...item,
          requestingUser,
          adminUser,
          purchase,
        };
      })
    );

    const result = {
      items: enrichedItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return ApiResponseUtil.success(result);
  }

  async findOne(id: number, user: User) {
    const req = await this.requestRepository.findOne({
      where: { id, isRemoved: false },
    });

    if (!req) return ApiResponseUtil.error('Request not found');

    if (user.role === UserRole.ADMIN && req.adminUserId !== user.id)
      return ApiResponseUtil.error('Access denied');

    if (user.role === UserRole.BRANCH && req.requestingUserId !== user.id)
      return ApiResponseUtil.error('Access denied');

    // Enrich
    let requestingUser: any = null;
    let adminUser: any = null;
    let purchase: any = null;

    try {
      const reqUserRes = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/${req.requestingUserId}`)
      );
      requestingUser = reqUserRes.data.data || reqUserRes.data;
    } catch (e) { }

    try {
      const adminUserRes = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/${req.adminUserId}`)
      );
      adminUser = adminUserRes.data.data || adminUserRes.data;
    } catch (e) { }

    try {
      const purchaseRes = await firstValueFrom(
        this.httpService.get(`${this.purchaseServiceUrl}/purchases/${req.purchaseId}`)
      );
      purchase = purchaseRes.data.data || purchaseRes.data;
    } catch (e) { }

    const enriched = {
      ...req,
      requestingUser,
      adminUser,
      purchase,
    };

    return ApiResponseUtil.success(enriched);
  }

  async update(id: number, dto: UpdateRequestDto, user: User) {
    const found = await this.findOne(id, user);
    if (!found.success) return found;

    const request = found.data as any; // enriched

    const oldStatus = request.status;
    const newStatus = dto.status;

    // Permission checks
    if (newStatus) {
      if (user.role === UserRole.ADMIN) {
        if (request.adminUserId !== user.id)
          return ApiResponseUtil.error('Only assigned admin can update this request');

        if (![RequestStatus.ACCEPT, RequestStatus.REJECT, RequestStatus.IN_TRANSIT].includes(newStatus))
          return ApiResponseUtil.error('Admins can only set Accept, Reject, or InTransit');
      } else if (user.role === UserRole.BRANCH) {
        if (request.requestingUserId !== user.id)
          return ApiResponseUtil.error('Access denied');

        if (!(newStatus === RequestStatus.DELIVERED && oldStatus === RequestStatus.IN_TRANSIT))
          return ApiResponseUtil.error('Branch can only mark InTransit → Delivered');
      }

      const transitionCheck = await this.validateStatusTransition(oldStatus, newStatus, request);
      if (transitionCheck) return transitionCheck;
    }

    // Apply update
    Object.assign(request, dto);
    const updated = await this.requestRepository.save(request);

    if (oldStatus && newStatus && oldStatus !== newStatus) {
      await this.createRequestStatusNotification(request, oldStatus, newStatus, user);
    }

    // FIFO deduction WHEN ACCEPTED
    if (newStatus === RequestStatus.ACCEPT && oldStatus !== RequestStatus.ACCEPT) {
      await this.deductStockFIFO(request);

      // TODO: Uncomment when alert service is available
      // const adminBranchId = request.adminUser?.branchId ?? request.purchase?.branchId;
      // if (adminBranchId && Number(adminBranchId) > 0) {
      //   try {
      //     await this.alertService.generateAlertsForBranch(Number(adminBranchId));
      //   } catch (err) {
      //     console.error('Failed to regenerate alerts after FIFO:', err);
      //   }
      // } else {
      //   console.warn('Admin branchId missing; skipping alert regeneration for request id:', request.id);
      // }
    }

    // Delivery: give stock to branch (keeps previous behavior)
    if (newStatus === RequestStatus.DELIVERED && oldStatus !== RequestStatus.DELIVERED) {
      await this.handleDelivery(request);
    }

    return ApiResponseUtil.success(updated, 'Request updated successfully');
  }

  // VALIDATIONS -------------------------------
  private async validateStatusTransition(
    oldStatus: RequestStatus,
    newStatus: RequestStatus,
    request: any,
  ) {
    const valid: Record<RequestStatus, RequestStatus[]> = {
      [RequestStatus.REQUEST]: [RequestStatus.ACCEPT, RequestStatus.REJECT],
      [RequestStatus.ACCEPT]: [RequestStatus.IN_TRANSIT],
      [RequestStatus.IN_TRANSIT]: [RequestStatus.DELIVERED],
      [RequestStatus.REJECT]: [],
      [RequestStatus.DELIVERED]: [],
    };

    if (!valid[oldStatus]?.includes(newStatus))
      return ApiResponseUtil.error(`Invalid transition ${oldStatus} → ${newStatus}`);

    if (newStatus === RequestStatus.ACCEPT) {
      const stockCheck = await this.validateStockAvailability(request);
      if (stockCheck) return stockCheck;
    }

    return null;
  }

  private async validateStockAvailability(request: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.purchaseServiceUrl}/purchases?userId=${request.adminUserId}`)
      );
      const purchases: PurchaseData[] = response.data.data ?? [];

      const total = purchases
        .filter(p => p.productName.toLowerCase() === request.purchase.productName.toLowerCase())
        .reduce((sum, p) => sum + Number(p.quantity), 0);

      if (total < request.quantityRequested)
        return ApiResponseUtil.error(`Not enough stock. Available: ${total}, Requested: ${request.quantityRequested}`);
    } catch (error) {
      return ApiResponseUtil.error('Failed to check stock availability');
    }

    return null;
  }

  private async deductStockFIFO(request: any) {
    let needed = Number(request.quantityRequested);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.purchaseServiceUrl}/purchases?userId=${request.adminUserId}`)
      );
      const purchases: PurchaseData[] = response.data.data ?? [];

      const relevantPurchases = purchases
        .filter(p => p.productName.toLowerCase() === request.purchase.productName.toLowerCase())
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      for (const p of relevantPurchases) {
        if (needed <= 0) break;

        const available = Number(p.quantity);

        if (available >= needed) {
          const newQuantity = available - needed;
          await firstValueFrom(
            this.httpService.patch(`${this.purchaseServiceUrl}/purchases/${p.id}`, {
              quantity: newQuantity,
              totalPrice: newQuantity * p.pricePerUnit,
            })
          );
          needed = 0;
        } else {
          needed -= available;
          await firstValueFrom(
            this.httpService.patch(`${this.purchaseServiceUrl}/purchases/${p.id}`, {
              quantity: 0,
              totalPrice: 0,
              isRemoved: true,
            })
          );
        }
      }

      if (needed > 0) {
        throw new Error('FIFO mismatch: insufficient stock after validation.');
      }

      // TODO: Update alerts
      // const finalStock = ... calculate
      // await this.alertService.updateProductAlert(...);
    } catch (error) {
      console.error('Error in deductStockFIFO:', error);
      throw error;
    }
  }

  // DELIVERED: BRANCH GETS STOCK -----------------
  private async handleDelivery(request: any) {
    // Create a new purchase for the requesting user with the requested quantity
    // Need to get pricePerUnit from admin's purchases
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.purchaseServiceUrl}/purchases?userId=${request.adminUserId}`)
      );
      const purchases: PurchaseData[] = response.data.data ?? [];
      const relevantPurchase = purchases.find(p => p.productName.toLowerCase() === request.productName.toLowerCase());
      if (!relevantPurchase) {
        console.error('No purchase found for delivery');
        return;
      }

      const newPurchase = {
        productName: request.productName,
        quantity: request.quantityRequested,
        pricePerUnit: relevantPurchase.pricePerUnit,
        totalPrice: request.quantityRequested * relevantPurchase.pricePerUnit,
        userId: request.requestingUserId,
        branchId: null, // or fetch branch
      };

      await firstValueFrom(
        this.httpService.post(`${this.purchaseServiceUrl}/purchases`, newPurchase)
      );
    } catch (error) {
      console.error('Failed to handle delivery:', error);
    }
  }

  // ADMIN DROPDOWN ------------------------------
  async getAdminsForDropdown(productName?: string, user?: User) {
    if (productName) {
      const response = await firstValueFrom(
        this.httpService.get(`${this.purchaseServiceUrl}/purchases?productName=${productName}`)
      );
      const purchases: PurchaseData[] = response.data.data ?? [];

      const userIds = [...new Set(
        purchases
          .map((p: any) => p.userId)
          .filter(id => id !== user?.id)
      )];

      if (userIds.length === 0) {
        const allAdminsRes = await firstValueFrom(
          this.httpService.get(`${this.userServiceUrl}/users?role=${UserRole.ADMIN}`)
        );
        return ApiResponseUtil.success(allAdminsRes.data.data ?? []);
      }

      const admins: any[] = [];
      for (const id of userIds) {
        const userRes = await firstValueFrom(
          this.httpService.get(`${this.userServiceUrl}/users/${id}`)
        );
        if (userRes.data.data?.role === UserRole.ADMIN) {
          admins.push(userRes.data.data);
        }
      }
      return ApiResponseUtil.success(admins);
    } else {
      const response = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users?role=${UserRole.ADMIN}`)
      );
      return ApiResponseUtil.success(response.data ?? []);
    }
  }

  async remove(id: number) {
    await this.requestRepository.update(id, { isRemoved: true });
    return ApiResponseUtil.success(null, 'Request removed successfully');
  }

  private async createRequestStatusNotification(request: any, oldStatus: RequestStatus, newStatus: RequestStatus, user: User): Promise<void> {
    try {
      const title = `Request Status Updated`;
      const message = `Request #${request.id} status changed from ${oldStatus} to ${newStatus}.`;

      // Notify the other party
      if (user.role === UserRole.ADMIN) {
        // Admin updated, notify branch user
        await firstValueFrom(this.httpService.post(`${this.notificationServiceUrl}/notifications`, {
          title,
          message,
          type: NotificationType.USER,
          userId: request.requestingUserId,
        }));
      } else if (user.role === UserRole.BRANCH) {
        // Branch updated, notify admin
        await firstValueFrom(this.httpService.post(`${this.notificationServiceUrl}/notifications`, {
          title,
          message,
          type: NotificationType.USER,
          userId: request.adminUserId,
        }));
      }
    } catch (error) {
      console.error('Failed to create request status notification:', error);
    }
  }

  private async createRequestCreationNotifications(request: Request, requestingUser: User): Promise<void> {
    try {
      const title = 'New Request Created';
      const message = `A new request has been created by branch user.`;

      // Notify admin
      await firstValueFrom(this.httpService.post(`${this.notificationServiceUrl}/notifications`, {
        title,
        message,
        type: NotificationType.USER,
        userId: request.adminUserId,
      }));
    } catch (error) {
      console.error('Failed to create request creation notification:', error);
    }
  }
}