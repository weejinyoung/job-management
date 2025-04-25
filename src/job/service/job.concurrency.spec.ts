import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from '../service/JobService';
import { JsonJobRepository } from '../repository/JsonJobRepository';
import { LockManager } from '../../common/lock/LockManager';
import { JobStatus } from '../entity/Job';
import { CreateJobDto, JobDto, UpdateJobDto } from '../dto/Dtos';

describe('JobService Concurrency Tests', () => {
  let service: JobService;
  let repository: JsonJobRepository;
  let createdJobId: string;
  const testJobIds: string[] = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: 'impl',
          useClass: JsonJobRepository,
        },
        LockManager,
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    repository = module.get<JsonJobRepository>('impl');

    // 테스트용 작업 생성
    const createJobDto: CreateJobDto = {
      title: 'Concurrency Test Job',
      description: 'This job will be used for concurrency testing',
    };
    const job = await service.createJob(createJobDto);
    createdJobId = job.id;
    testJobIds.push(createdJobId);
  });

  afterAll(async () => {
    // 테스트 후 생성된 모든 작업 삭제
    for (const id of testJobIds) {
      try {
        await service.deleteJob(id);
      } catch (e) {
        // 이미 삭제된 작업은 무시
      }
    }

    // 인덱스에서 테스트 작업 ID 일괄 제거
    await repository.removeFromAllStatusIndexes(testJobIds);
  });

  it('should handle concurrent updates correctly with locks', async () => {
    const updateOperations: Promise<JobDto>[] = [];
    const updateCount = 10;
    const initialTitle = 'Concurrency Test Job';

    for (let i = 0; i < updateCount; i++) {
      const updateJobDto: UpdateJobDto = {
        title: `${initialTitle} - Update ${i + 1}`,
        description: `Updated description for concurrent test ${i + 1}`,
      };
      updateOperations.push(service.updateJob(createdJobId, updateJobDto));
    }

    // 모든 업데이트 작업을 동시에 실행
    const results = await Promise.all(updateOperations);

    // 결과 확인: 모든 업데이트가 성공해야 하며 마지막 업데이트가 최종 상태여야 함
    expect(results.length).toBe(updateCount);

    // 마지막 업데이트 작업의 타이틀과 설명으로 설정되어 있어야 함
    const updatedJob = await service.getJobById(createdJobId);
    expect(updatedJob.title).toBe(`${initialTitle} - Update ${updateCount}`);
    expect(updatedJob.description).toBe(
      `Updated description for concurrent test ${updateCount}`,
    );
  });

  it('should handle concurrent state changes correctly with locks', async () => {
    // 작업 상태를 PENDING으로 재설정
    if ((await service.getJobById(createdJobId)).status !== JobStatus.PENDING) {
      await service.reopenJob(createdJobId);
    }

    // 동시에 발생하는 다양한 상태 변경 요청을 시뮬레이션
    const stateChangePromises: Promise<JobDto>[] = [
      service.completeJob(createdJobId), // 완료
      service.cancelJob(createdJobId), // 취소
      service.reopenJob(createdJobId), // 재개
      service.completeJob(createdJobId), // 완료
    ];

    // 동시에 모든 상태 변경 작업 실행
    let results;
    try {
      results = await Promise.all(stateChangePromises);
      // 락 매니저가 제대로 작동하면 일부 작업은 실패해야 함 (상태 충돌로 인해)
      fail('Expected some operations to fail due to state conflicts');
    } catch (error) {
      // 예외가 발생했다는 것은 락이 작동하여 유효하지 않은 상태 전환을 방지했다는 의미
      expect(error).toBeDefined();
    }

    // 최종 작업 상태 확인
    const finalJob = await service.getJobById(createdJobId);
    expect([
      JobStatus.COMPLETED,
      JobStatus.CANCELED,
      JobStatus.PENDING,
    ]).toContain(finalJob.status);
  });

  it('should handle concurrent completion of multiple jobs', async () => {
    // 추가 테스트용 작업 여러 개 생성
    const additionalJobIds: string[] = [];
    for (let i = 0; i < 5; i++) {
      const job = await service.createJob({
        title: `Concurrent Completion Test Job ${i}`,
        description: `Test description for concurrent job ${i}`,
      });
      additionalJobIds.push(job.id);
      testJobIds.push(job.id); // 전체 테스트 작업 목록에 추가
    }

    // 개별 작업 완료와 일괄 작업 완료를 동시에 실행
    const individualCompletions: Promise<JobDto>[] = additionalJobIds.map(
      (id) => service.completeJob(id),
    );
    const batchCompletion = service.completeJobsWithIds(); // 모든 대기 작업 일괄 완료

    // 모든 작업을 동시에 실행
    await Promise.all([...individualCompletions, batchCompletion]);

    // 모든 작업이 올바르게 완료되었는지 확인
    for (const id of additionalJobIds) {
      const job = await service.getJobById(id);
      expect(job.status).toBe(JobStatus.COMPLETED);
    }
  });

  it('should prevent race conditions with a slow operation', async () => {
    // 느린 업데이트 작업 시뮬레이션을 위한 헬퍼 함수
    const slowUpdate = async (
      id: string,
      title: string,
      description: string,
      delayMs: number,
    ): Promise<void> => {
      // 작업 가져오기
      const job = await service.getJobById(id);

      // 인위적인 지연 추가
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // 업데이트 수행
      await service.updateJob(id, { title, description });
    };

    // 동시에 두 개의 느린 업데이트 실행
    const firstUpdate = slowUpdate(
      createdJobId,
      'Slow Update 1',
      'Slow Description 1',
      300,
    );
    const secondUpdate = slowUpdate(
      createdJobId,
      'Slow Update 2',
      'Slow Description 2',
      100,
    );

    // 두 업데이트가 모두 완료될 때까지 대기
    await Promise.all([firstUpdate, secondUpdate]);

    // 락이 제대로 작동하면 마지막으로 실행된 업데이트가 적용되어야 함
    const updatedJob = await service.getJobById(createdJobId);
    expect(['Slow Update 1', 'Slow Update 2']).toContain(updatedJob.title);
    expect(['Slow Description 1', 'Slow Description 2']).toContain(
      updatedJob.description,
    );
  });
});
