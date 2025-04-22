import { Injectable } from '@nestjs/common';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { Job, JobStatusType } from '../entity/Job';
import { JobRepository } from './JobRepository';
import { AppException } from 'src/common/exception/BaseException';
import { BaseResponseCode } from 'src/common/response/BaseResponseCode';
import { JobResponseCode } from '../response/JobResponseCode';
import { jobFromJSON, jobToJSON } from './EntityToJsonConverter';
import { Page } from '../../common/response/Page';

@Injectable()
export class JsonJobRepository implements JobRepository {
  private db: JsonDB;
  private readonly JOB_MAP_PATH = '/jobMap';

  constructor() {
    // 데이터베이스 초기화 - 세 번째 매개변수(humanReadable)는 필요에 따라 설정
    this.db = new JsonDB(new Config('jobs', true, true, '/'));
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // 새로운 형식의 데이터베이스 구조 확인 (맵 방식)
      try {
        await this.db.getData(this.JOB_MAP_PATH);
      } catch (error) {
        // jobMap 경로가 없으면 빈 객체로 초기화
        await this.db.push(this.JOB_MAP_PATH, {}, false);
      }
    } catch (error) {
      // 파일이 없는 경우에도 초기화
      await this.db.push(this.JOB_MAP_PATH, {}, false);
    }
  }

  async saveAll(jobs: Job[]): Promise<void> {
    try {
      // 각 작업을 개별적으로 저장
      for (const job of jobs) {
        await this.db.push(`${this.JOB_MAP_PATH}/${job.id}`, jobToJSON(job), false);
      }
    } catch (error) {
      throw new AppException(BaseResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<Job[]> {
    try {
      const jobMap = await this.db.getData(this.JOB_MAP_PATH);
      const jobs = Object.values(jobMap).map((data) => jobFromJSON(data));
      return jobs;
    } catch (error) {
      if (error.message && error.message.includes("Can't find dataPath")) {
        return [];
      }
      throw new AppException(BaseResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllPaginated(page: number, size: number): Promise<Page<Job>> {
    try {
      // 1. 데이터베이스에서 모든 키를 가져옵니다 (전체 데이터가 아닌 키만)
      const jobsObj = await this.db.getData(this.JOB_MAP_PATH);
      const keys = Object.keys(jobsObj);

      // 2. 전체 요소 수와 페이지 계산
      const totalElements = keys.length;
      const totalPages = Math.ceil(totalElements / size);

      // 3. 현재 페이지에 필요한 키만 선택합니다
      const startIndex = page * size;
      const endIndex = Math.min(startIndex + size, totalElements);
      const pageKeys = keys.slice(startIndex, endIndex);

      // 4. 선택된 키에 해당하는 작업 데이터만 가져옵니다
      const paginatedJobs: Job[] = [];
      for (const key of pageKeys) {
        const jobData = await this.db.getData(`${this.JOB_MAP_PATH}/${key}`);
        paginatedJobs.push(jobFromJSON(jobData));
      }

      // 5. 페이지 객체 반환
      return new Page<Job>(paginatedJobs, {
        totalElements,
        totalPages,
        size,
        page,
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      if (error.message && error.message.includes("Can't find dataPath")) {
        return new Page<Job>([], {
          totalElements: 0,
          totalPages: 0,
          size,
          page,
        });
      }
      throw new AppException(BaseResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string): Promise<Job | null> {
    try {
      // 직접 특정 ID의 작업 데이터 가져오기
      const jobData = await this.db.getData(`${this.JOB_MAP_PATH}/${id}`);
      return jobFromJSON(jobData);
    } catch (error) {
      if (error.message && error.message.includes("Can't find dataPath")) {
        return null;
      }
      throw new AppException(BaseResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async create(job: Job): Promise<Job> {
    try {
      // 직접 ID로 확인
      try {
        await this.db.getData(`${this.JOB_MAP_PATH}/${job.id}`);
        // 이미 존재하면 예외 발생
        throw new AppException(JobResponseCode.JOB_ALREADY_EXISTS);
      } catch (error) {
        if (error instanceof AppException) {
          throw error;
        }
        // 존재하지 않는 경우 (에러가 발생한 경우) 생성
        await this.db.push(`${this.JOB_MAP_PATH}/${job.id}`, jobToJSON(job), false);
        return job;
      }
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(BaseResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async update(job: Job): Promise<Job> {
    try {
      // 직접 ID로 확인
      try {
        await this.db.getData(`${this.JOB_MAP_PATH}/${job.id}`);
        // 존재하면 업데이트
        await this.db.push(`${this.JOB_MAP_PATH}/${job.id}`, jobToJSON(job), false);
        return job;
      } catch (error) {
        // 존재하지 않으면 예외 발생
        throw new AppException(JobResponseCode.JOB_NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(BaseResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      // 존재 여부 확인
      try {
        await this.db.getData(`${this.JOB_MAP_PATH}/${id}`);
        // 존재하면 삭제
        await this.db.delete(`${this.JOB_MAP_PATH}/${id}`);
        return true;
      } catch (error) {
        // 존재하지 않으면 예외 발생
        throw new AppException(JobResponseCode.JOB_NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(BaseResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findByTitle(title: string): Promise<Job[]> {
    // 제목으로 검색은 전체 데이터 로드 필요
    try {
      const jobs = await this.findAll();
      return jobs.filter((job) =>
        job.title.toLowerCase().includes(title.toLowerCase()),
      );
    } catch (error) {
      throw new AppException(BaseResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async search(params: {
    status?: JobStatusType;
    title?: string;
  }): Promise<Job[]> {
    // 검색은 전체 데이터 로드 필요
    try {
      let jobs = await this.findAll();

      if (params.status) {
        jobs = jobs.filter((job) => job.status === params.status);
      }

      if (params.title && params.title.trim() !== '') {
        jobs = jobs.filter((job) =>
          job.title.toLowerCase().includes(params.title!.toLowerCase()),
        );
      }

      return jobs;
    } catch (error) {
      throw new AppException(BaseResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findJobsByStatus(status: JobStatusType): Promise<Job[]> {
    try {
      // 객체의 키만 먼저 가져옵니다
      const jobsObj = await this.db.getData(this.JOB_MAP_PATH);
      const keys = Object.keys(jobsObj);

      // 상태를 확인하기 위해 각 작업을 개별적으로 확인합니다
      const matchingJobs: Job[] = [];
      for (const key of keys) {
        const jobData = await this.db.getData(`${this.JOB_MAP_PATH}/${key}`);
        const job = jobFromJSON(jobData);

        if (job.status === status) {
          matchingJobs.push(job);
        }
      }

      return matchingJobs;
    } catch (error) {
      if (error.message && error.message.includes("Can't find dataPath")) {
        return [];
      }
      throw new AppException(BaseResponseCode.INTERNAL_SERVER_ERROR);
    }
  }
}