import { Module } from '@nestjs/common';
import { JobModule } from './job/job.module';
import { CommonModule } from './common/common.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [JobModule, CommonModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
