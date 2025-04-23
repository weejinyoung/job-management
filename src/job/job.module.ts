import { Module } from '@nestjs/common';
import { JobService } from './service/JobService';
import { JobController } from './controller/JobController';
import { JsonJobRepository } from './repository/JsonJobRepository';
import { JobScheduler } from './schedule/JobScheduler';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [JobController],
  providers: [
    JobService,
    JobScheduler,
    {
      provide: 'impl',
      useClass: JsonJobRepository,
    },
  ],
  exports: [JobService],
})
export class JobModule {}