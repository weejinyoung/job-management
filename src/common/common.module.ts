import { Module } from '@nestjs/common';
import { LockManager } from './lock/LockManager';

@Module({
  providers: [LockManager],
  exports: [LockManager],
})
export class CommonModule {}
