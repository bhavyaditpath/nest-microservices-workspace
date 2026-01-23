import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BranchModule } from './branch/branch.module';
import { PurchaseModule } from './purchase/purchase.module';
import { InventoryModule } from './inventory/inventory.module';
import { RequestModule } from './request/request.module';
import { NotificationModule } from './notification/notification.module';
import { ReportModule } from './report/report.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AlertModule } from './alert/alert.module';

@Module({
  imports: [HttpModule, AuthModule, UserModule, BranchModule, PurchaseModule, InventoryModule, RequestModule, NotificationModule, ReportModule, DashboardModule, AlertModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
