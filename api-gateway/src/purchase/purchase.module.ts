import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PurchaseController } from './purchase.controller';

@Module({
  imports: [HttpModule],
  controllers: [PurchaseController],
})
export class PurchaseModule {}