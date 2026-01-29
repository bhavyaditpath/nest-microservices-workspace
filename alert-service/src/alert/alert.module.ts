import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { StockAlert } from './alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockAlert]), HttpModule],
  controllers: [AlertController],
  providers: [AlertService]
})
export class AlertModule {}
