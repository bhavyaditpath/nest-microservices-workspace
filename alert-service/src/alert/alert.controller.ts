import { Controller, Get, Post, Body, Put, Patch, Param, Delete, Query } from '@nestjs/common';
import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { ResolveAlertDto } from './dto/resolve-alert.dto';
import { DismissAlertDto } from './dto/dismiss-alert.dto';
import { AlertStatus } from 'shared';

@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertService.create(createAlertDto);
  }

  @Get('branch/:branchId')
  findByBranch(
    @Param('branchId') branchId: string,
    @Query('status') status: AlertStatus,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.alertService.findByBranch(+branchId, status, +page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertService.update(+id, updateAlertDto);
  }

  @Put(':id/resolve')
  resolve(@Param('id') id: string, @Body() resolveAlertDto: ResolveAlertDto) {
    return this.alertService.resolve(+id, resolveAlertDto);
  }

  @Put(':id/dismiss')
  dismiss(@Param('id') id: string, @Body() dismissAlertDto: DismissAlertDto) {
    return this.alertService.dismiss(+id, dismissAlertDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertService.remove(+id);
  }

  @Post('generate/:branchId')
  generateAlertsForBranch(@Param('branchId') branchId: string) {
    return this.alertService.generateAlertsForBranch(+branchId);
  }

  @Post('update-product')
  updateProductAlert(@Body() body: { itemName: string; brand: string; branchId: number; currentStock: number; minStock: number }) {
    return this.alertService.updateProductAlert(body.itemName, body.brand, body.branchId, body.currentStock, body.minStock);
  }
}
