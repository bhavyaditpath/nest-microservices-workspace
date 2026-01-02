import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';

@Module({
  controllers: [BranchController],
})
export class BranchModule {}