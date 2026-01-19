import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { GetReportSummaryDto } from './dto/get-report-summary.dto';
import { ApiResponseUtil } from 'shared';

@Controller('purchases')
export class PurchaseController {
    constructor(private readonly purchaseService: PurchaseService) { }

    @Get('report-summary')
    async getReportSummary(@Query() dto: GetReportSummaryDto) {
        console.log('DTO RECEIVED:', dto);
        const data = await this.purchaseService.getReportSummary(
            dto.startDate,
            dto.endDate,
            dto.userId,
        );

        return ApiResponseUtil.success(
            data,
            'Report summary retrieved successfully',
        );
    }

    @Get()
    async findAll(
        @Query('userId') userId?: string,
        @Query('productName') productName?: string,
    ) {
        const data = await this.purchaseService.findAll(
            userId ? parseInt(userId) : undefined,
            productName,
        );
        return ApiResponseUtil.success(data, 'Purchases retrieved successfully');
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.purchaseService.findOne(id);
        return ApiResponseUtil.success(data, 'Purchase retrieved successfully');
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePurchaseDto: UpdatePurchaseDto,
    ) {
        const data = await this.purchaseService.update(id, updatePurchaseDto);
        return ApiResponseUtil.success(data, 'Purchase updated successfully');
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.purchaseService.remove(id);
        return ApiResponseUtil.success(null, 'Purchase deleted successfully');
    }

}
