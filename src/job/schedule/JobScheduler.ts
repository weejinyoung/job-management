import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { JobService } from '../service/JobService';

@Injectable()
export class JobScheduler {
  private readonly logger = new Logger(JobScheduler.name);
  private readonly logFilePath = path.join(process.cwd(), 'logs.txt');

  constructor(private readonly jobService: JobService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processJobs() {
    this.logger.log('Scheduled job started: Processing pending jobs');

    try {
      // pending 상태의 모든 작업을 completed로 업데이트
      const updatedCount = await this.jobService.completeJobs();

      const logMessage = `[${new Date().toISOString()}] Updated ${updatedCount} pending jobs to completed`;
      this.logger.log(logMessage);

      // 파일에 로그 기록
      this.appendLog(logMessage);
    } catch (error) {
      const errorMessage = `[${new Date().toISOString()}] Error updating pending jobs: ${error.message}`;
      this.logger.error(errorMessage);

      // 파일에 에러 로그 기록
      this.appendLog(errorMessage);
    }
  }

  private appendLog(message: string): void {
    try {
      fs.appendFileSync(this.logFilePath, message + '\n');
    } catch (error) {
      this.logger.error(`Failed to write to log file: ${error.message}`);
    }
  }
}
