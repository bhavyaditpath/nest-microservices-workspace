import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AlertController } from './alert.controller';

@Module({
  imports: [HttpModule],
  controllers: [AlertController],
})
export class AlertModule {}