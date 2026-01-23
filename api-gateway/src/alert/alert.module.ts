import { Module } from '@nestjs/common';
import { AlertController } from './alert.controller';

@Module({
  controllers: [AlertController],
})
export class AlertModule {}