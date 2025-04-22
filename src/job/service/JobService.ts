import { Inject, Injectable } from '@nestjs/common';
import { Job, JobStatus } from '../entity/Job';
import { AppException } from '../../common/exception/BaseException';
import { JobResponseCode } from '../response/JobResponseCode';
import { CreateJobDto, JobDto, SearchJobDto, UpdateJobDto } from '../dto/Dtos';
import { JobRepository } from '../repository/JobRepository';
import { Page } from '../../common/response/Page';

@Injectable()
export class JobService {
  constructor(
    @Inject('impl')
    private readonly jobRepository: JobRepository,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<JobDto> {
    const { title, description } = createJobDto;
    const job = new Job(title, description);
    const createdJob = await this.jobRepository.create(job);
    return JobDto.fromEntity(createdJob);
  }

  async findAll(): Promise<JobDto[]> {
    const jobs = await this.jobRepository.findAll();
    return JobDto.fromEntities(jobs);
  }

  async findAllPaginated(page: number, size: number): Promise<Page<JobDto>> {
    // 유효한 페이지 매개변수 확인
    const validPage = Math.max(0, page);
    const validSize = Math.max(1, Math.min(100, size)); // 최소 1, 최대 100

    // 페이지네이션 로직을 레포지토리로 위임
    const jobsPage = await this.jobRepository.findAllPaginated(
      validPage,
      validSize,
    );

    // 엔티티를 DTO로 변환
    const jobDtos = JobDto.fromEntities(jobsPage.data);

    // 동일한 메타데이터로 Page<JobDto> 생성
    return new Page<JobDto>(jobDtos, jobsPage.metadata);
  }

  async findById(id: string): Promise<JobDto> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new AppException(JobResponseCode.JOB_NOT_FOUND);
    }

    return JobDto.fromEntity(job);
  }

  async search(searchParams: SearchJobDto): Promise<JobDto[]> {
    // 검색 조건이 없으면 전체 목록 반환
    if (
      !searchParams.status &&
      (!searchParams.title || searchParams.title.trim() === '')
    ) {
      return this.findAll();
    }

    const jobs = await this.jobRepository.search(searchParams);
    return JobDto.fromEntities(jobs);
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<JobDto> {
    // 유효한 업데이트 데이터인지 확인
    if (!updateJobDto.title && !updateJobDto.description) {
      // 변경 사항이 없으면 현재 상태 반환
      return this.findById(id);
    }

    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new AppException(JobResponseCode.JOB_NOT_FOUND);
    }

    // 변경된 필드만 업데이트
    if (updateJobDto.title) {
      job.updateTitle(updateJobDto.title);
    }

    if (updateJobDto.description) {
      job.updateDescription(updateJobDto.description);
    }

    const updatedJob = await this.jobRepository.update(job);
    return JobDto.fromEntity(updatedJob);
  }

  async completeJob(id: string): Promise<JobDto> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new AppException(JobResponseCode.JOB_NOT_FOUND);
    }
    job.complete();
    const updatedJob = await this.jobRepository.update(job);
    return JobDto.fromEntity(updatedJob);
  }

  async cancelJob(id: string): Promise<JobDto> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new AppException(JobResponseCode.JOB_NOT_FOUND);
    }
    job.cancel();
    const updatedJob = await this.jobRepository.update(job);
    return JobDto.fromEntity(updatedJob);
  }

  async reopenJob(id: string): Promise<JobDto> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new AppException(JobResponseCode.JOB_NOT_FOUND);
    }
    job.reopen();
    const updatedJob = await this.jobRepository.update(job);
    return JobDto.fromEntity(updatedJob);
  }

  async completeJobs(): Promise<number> {
    // 대기 상태인 작업만 가져오기
    const jobsToUpdate = await this.jobRepository.findJobsByStatus(
      JobStatus.PENDING,
    );

    // 작업이 없으면 바로 반환
    if (jobsToUpdate.length === 0) {
      return 0;
    }

    // 각 작업을 완료 상태로 변경
    for (const job of jobsToUpdate) {
      job.complete();
    }

    // 변경된 작업들 저장
    await this.jobRepository.saveAll(jobsToUpdate);

    return jobsToUpdate.length;
  }

  async delete(id: string): Promise<boolean> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new AppException(JobResponseCode.JOB_NOT_FOUND);
    }

    return this.jobRepository.delete(id);
  }
}
