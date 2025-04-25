import { Inject, Injectable } from '@nestjs/common';
import { Job, JobStatus } from '../entity/Job';
import { AppException } from '../../common/exception/AppException';
import { CreateJobDto, JobDto, SearchJobDto, UpdateJobDto } from '../dto/Dtos';
import { JobRepository } from '../repository/JobRepository';
import { Page } from '../../common/response/Page';
import { LockManager } from '../../common/lock/LockManager';
import { ResponseCode } from '../../common/response/ResponseCode';

@Injectable()
export class JobService {
  constructor(
    @Inject('impl')
    private readonly jobRepository: JobRepository,
    private readonly lockManager: LockManager,
  ) {}

  async createJob(createJobDto: CreateJobDto): Promise<JobDto> {
    const { title, description } = createJobDto;
    const job = new Job(title, description);
    const createdJob = await this.jobRepository.create(job);
    return JobDto.fromEntity(createdJob);
  }

  async getAllJob(): Promise<JobDto[]> {
    const jobs = await this.jobRepository.findAll();
    return JobDto.fromEntities(jobs);
  }

  async getJobsPaginated(page: number, size: number): Promise<Page<JobDto>> {
    const validPage = Math.max(0, page);
    const validSize = Math.max(1, Math.min(100, size));
    const jobsPage = await this.jobRepository.findAllPaginated(
      validPage,
      validSize,
    );
    const jobDtos = JobDto.fromEntities(jobsPage.data);
    return new Page<JobDto>(jobDtos, jobsPage.metadata);
  }

  async getJobById(id: string): Promise<JobDto> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new AppException(ResponseCode.JOB_NOT_FOUND);
    }
    return JobDto.fromEntity(job);
  }

  async searchJob(searchParams: SearchJobDto): Promise<JobDto[]> {
    if (
      !searchParams.status &&
      (!searchParams.title || searchParams.title.trim() === '')
    ) {
      return this.getAllJob();
    }
    const jobs = await this.jobRepository.search(searchParams);
    return JobDto.fromEntities(jobs);
  }

  async updateJob(id: string, updateJobDto: UpdateJobDto): Promise<JobDto> {
    return await this.lockManager.withLock(id, async () => {
      const job = await this.jobRepository.findById(id);
      if (!job) {
        throw new AppException(ResponseCode.JOB_NOT_FOUND);
      }
      if (updateJobDto.title) {
        job.updateTitle(updateJobDto.title);
      }
      if (updateJobDto.description) {
        job.updateDescription(updateJobDto.description);
      }
      const updatedJob = await this.jobRepository.update(job);
      return JobDto.fromEntity(updatedJob);
    });
  }

  async completeJob(id: string): Promise<JobDto> {
    return await this.lockManager.withLock(id, async () => {
      const job = await this.jobRepository.findById(id);
      if (!job) {
        throw new AppException(ResponseCode.JOB_NOT_FOUND);
      }
      job.complete();
      const updatedJob = await this.jobRepository.update(job);
      return JobDto.fromEntity(updatedJob);
    });
  }

  async cancelJob(id: string): Promise<JobDto> {
    return await this.lockManager.withLock(id, async () => {
      const job = await this.jobRepository.findById(id);
      if (!job) {
        throw new AppException(ResponseCode.JOB_NOT_FOUND);
      }
      job.cancel();
      const updatedJob = await this.jobRepository.update(job);
      return JobDto.fromEntity(updatedJob);
    });
  }

  async reopenJob(id: string): Promise<JobDto> {
    return await this.lockManager.withLock(id, async () => {
      const job = await this.jobRepository.findById(id);
      if (!job) {
        throw new AppException(ResponseCode.JOB_NOT_FOUND);
      }
      job.reopen();
      const updatedJob = await this.jobRepository.update(job);
      return JobDto.fromEntity(updatedJob);
    });
  }

  async completeJobsWithIds(): Promise<{ count: number; jobIds: string[] }> {
    const pendingJobIds = await this.jobRepository.findJobIdsByStatus(
      JobStatus.PENDING,
    );

    if (pendingJobIds.length === 0) {
      return { count: 0, jobIds: [] };
    }

    return await this.lockManager.withMultipleLocks(pendingJobIds, async () => {
      const jobsToUpdate =
        await this.jobRepository.findJobsByIds(pendingJobIds);

      // 실제로 pending 상태인 작업만 필터링 (다른 프로세스에 의해 상태가 변경되었을 수 있음)
      const pendingJobs = jobsToUpdate.filter(
        (job) => job.status === JobStatus.PENDING,
      );

      if (pendingJobs.length === 0) {
        return { count: 0, jobIds: [] };
      }

      const completedJobIds: string[] = [];

      for (const job of pendingJobs) {
        job.complete();
        completedJobIds.push(job.id);
      }

      await this.jobRepository.saveAll(pendingJobs);
      return { count: pendingJobs.length, jobIds: completedJobIds };
    });
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.lockManager.withLock(id, async () => {
      const job = await this.jobRepository.findById(id);
      if (!job) {
        throw new AppException(ResponseCode.JOB_NOT_FOUND);
      }
      return this.jobRepository.delete(id);
    });
  }
}
