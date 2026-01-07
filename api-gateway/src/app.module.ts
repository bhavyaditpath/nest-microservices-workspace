import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BranchModule } from './branch/branch.module';
import { PurchaseModule } from './purchase/purchase.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [HttpModule, AuthModule, UserModule, BranchModule, PurchaseModule, InventoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
