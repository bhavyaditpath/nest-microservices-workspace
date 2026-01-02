import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BranchController } from './branch.controller';

@Module({
  imports: [HttpModule],
  controllers: [BranchController],
})
export class BranchModule {}