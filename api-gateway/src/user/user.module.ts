import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserController } from './user.controller';

@Module({
  imports: [HttpModule],
  controllers: [UserController],
})
export class UserModule {}