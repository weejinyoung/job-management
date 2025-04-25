import { Injectable } from '@nestjs/common';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { Job, JobStatusType } from '../entity/Job';
import { JobRepository } from './JobRepository';
import { AppException } from 'src/common/exception/AppException';
import { jobFromJSON, jobToJSON } from './JobEntityToJsonConverter';
import { Page } from '../../common/response/Page';
import { ResponseCode } from '../../common/response/ResponseCode';

@Injectable()
export class JsonJobRepository implements JobRepository {
  private db: JsonDB;
  private readonly JOB_MAP_PATH = '/jobMap';

  constructor() {
    this.db = new JsonDB(new Config('jobs', true, true, '/'));
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      try {
        await this.db.getData(this.JOB_MAP_PATH);
      } catch (error) {
        await this.db.push(this.JOB_MAP_PATH, {}, false);
      }
    } catch (error) {
      await this.db.push(this.JOB_MAP_PATH, {}, false);
    }
  }

  async saveAll(jobs: Job[]): Promise<void> {
    try {
      for (const job of jobs) {
        await this.db.push(
          `${this.JOB_MAP_PATH}/${job.id}`,
          jobToJSON(job),
          false,
        );
      }
    } catch (error) {
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
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
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
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
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string): Promise<Job | null> {
    try {
      const jobData = await this.db.getData(`${this.JOB_MAP_PATH}/${id}`);
      return jobFromJSON(jobData);
    } catch (error) {
      if (error.message && error.message.includes("Can't find dataPath")) {
        return null;
      }
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async create(job: Job): Promise<Job> {
    try {
      try {
        await this.db.getData(`${this.JOB_MAP_PATH}/${job.id}`);
        throw new AppException(ResponseCode.JOB_ALREADY_EXISTS);
      } catch (error) {
        if (error instanceof AppException) {
          throw error;
        }
        await this.db.push(
          `${this.JOB_MAP_PATH}/${job.id}`,
          jobToJSON(job),
          false,
        );
        return job;
      }
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async update(job: Job): Promise<Job> {
    try {
      try {
        await this.db.getData(`${this.JOB_MAP_PATH}/${job.id}`);
        await this.db.push(
          `${this.JOB_MAP_PATH}/${job.id}`,
          jobToJSON(job),
          false,
        );
        return job;
      } catch (error) {
        throw new AppException(ResponseCode.JOB_NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      try {
        await this.db.getData(`${this.JOB_MAP_PATH}/${id}`);
        await this.db.delete(`${this.JOB_MAP_PATH}/${id}`);
        return true;
      } catch (error) {
        throw new AppException(ResponseCode.JOB_NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findByTitle(title: string): Promise<Job[]> {
    try {
      const jobs = await this.findAll();
      return jobs.filter((job) =>
        job.title.toLowerCase().includes(title.toLowerCase()),
      );
    } catch (error) {
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async search(params: {
    status?: JobStatusType;
    title?: string;
  }): Promise<Job[]> {
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
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findJobsByStatus(status: JobStatusType): Promise<Job[]> {
    try {
      const jobsObj = await this.db.getData(this.JOB_MAP_PATH);
      const keys = Object.keys(jobsObj);

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
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findJobsByIds(ids: string[]): Promise<Job[]> {
    try {
      if (ids.length === 0) {
        return [];
      }

      const jobs: Job[] = [];

      for (const id of ids) {
        try {
          const jobData = await this.db.getData(`${this.JOB_MAP_PATH}/${id}`);
          jobs.push(jobFromJSON(jobData));
        } catch (error) {
          if (
            !error.message ||
            !error.message.includes("Can't find dataPath")
          ) {
            throw error;
          }
        }
      }

      return jobs;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findJobIdsByStatus(status: JobStatusType): Promise<string[]> {
    try {
      const jobsObj = await this.db.getData(this.JOB_MAP_PATH);
      const keys = Object.keys(jobsObj);
      const matchingIds: string[] = [];

      for (const key of keys) {
        const jobData = await this.db.getData(`${this.JOB_MAP_PATH}/${key}`);

        if (jobData.status === status) {
          matchingIds.push(key);
        }
      }

      return matchingIds;
    } catch (error) {
      if (error.message && error.message.includes("Can't find dataPath")) {
        return [];
      }
      throw new AppException(ResponseCode.INTERNAL_SERVER_ERROR);
    }
  }
}
