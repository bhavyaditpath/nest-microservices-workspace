import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BranchModule } from './branch/branch.module';

@Module({
  imports: [HttpModule, AuthModule, UserModule, BranchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
