import { Injectable } from '@nestjs/common';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { Job, JobStatus, JobStatusType } from '../entity/Job';
import { JobRepository } from './JobRepository';
import { AppException } from '../../common/exception/AppException';
import { jobFromJSON, jobToJSON } from './JobEntityToJsonConverter';
import { Page } from '../../common/response/Page';
import { ResponseCode } from '../../common/response/ResponseCode';

interface JobData {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

type StatusIndex = {
  pending: string[];
  completed: string[];
  canceled: string[];
};

@Injectable()
export class JsonJobRepository implements JobRepository {
  private db: JsonDB;
  private readonly JOB_MAP_PATH = '/jobMap';
  private readonly STATUS_INDEX_PATH = '/statusIndex';

  constructor() {
    this.db = new JsonDB(new Config('jobs', true, true, '/'));
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // 작업 맵 초기화
      try {
        await this.db.getData(this.JOB_MAP_PATH);
      } catch (error) {
        await this.db.push(this.JOB_MAP_PATH, {}, false);
      }

      // 상태 인덱스 초기화
      try {
        await this.db.getData(this.STATUS_INDEX_PATH);
      } catch (error) {
        await this.db.push(
          this.STATUS_INDEX_PATH,
          {
            pending: [],
            completed: [],
            canceled: [],
          },
          false,
        );
      }

      // 기존 데이터로 인덱스 재구축
      await this.rebuildStatusIndex();
    } catch (error) {
      console.error('초기화 중 오류:', error);
      await this.db.push(this.JOB_MAP_PATH, {}, false);
      await this.db.push(
        this.STATUS_INDEX_PATH,
        {
          pending: [],
          completed: [],
          canceled: [],
        },
        false,
      );
    }
  }

  private async rebuildStatusIndex(): Promise<void> {
    try {
      const jobMap = (await this.db.getData(this.JOB_MAP_PATH)) as Record<
        string,
        JobData
      >;

      const newIndex: StatusIndex = {
        pending: [],
        completed: [],
        canceled: [],
      };

      for (const [jobId, jobData] of Object.entries(jobMap)) {
        const status = jobData.status as JobStatusType;
        if (
          status === 'pending' ||
          status === 'completed' ||
          status === 'canceled'
        ) {
          newIndex[status].push(jobId);
        }
      }

      await this.db.push(this.STATUS_INDEX_PATH, newIndex, true);
    } catch (error) {
      console.error('인덱스 재구축 중 오류:', error);
      throw new AppException(ResponseCode.JSON_DB_ERROR);
    }
  }

  private async addToStatusIndex(
    jobId: string,
    status: JobStatusType,
  ): Promise<void> {
    try {
      const indexPath = `${this.STATUS_INDEX_PATH}/${status}`;
      let statusIds: string[] = [];

      try {
        statusIds = (await this.db.getData(indexPath)) as string[];
      } catch (error) {
        statusIds = [];
      }
      if (!statusIds.includes(jobId)) {
        statusIds.push(jobId);
        await this.db.push(indexPath, statusIds, true);
      }
    } catch (error) {
      console.error(`인덱스에 작업 추가 중 오류 (${jobId}, ${status}):`, error);
    }
  }

  private async removeFromStatusIndex(
    jobId: string,
    status: JobStatusType,
  ): Promise<void> {
    try {
      const indexPath = `${this.STATUS_INDEX_PATH}/${status}`;
      let statusIds: string[] = [];

      try {
        statusIds = (await this.db.getData(indexPath)) as string[];
      } catch (error) {
        return;
      }

      const newStatusIds = statusIds.filter((id) => id !== jobId);
      await this.db.push(indexPath, newStatusIds, true);
    } catch (error) {
      console.error(
        `인덱스에서 작업 제거 중 오류 (${jobId}, ${status}):`,
        error,
      );
    }
  }

  private async updateStatusIndex(
    jobId: string,
    oldStatus: JobStatusType,
    newStatus: JobStatusType,
  ): Promise<void> {
    if (oldStatus === newStatus) return;
    await this.removeFromStatusIndex(jobId, oldStatus);
    await this.addToStatusIndex(jobId, newStatus);
  }

  async saveAll(jobs: Job[]): Promise<void> {
    try {
      for (const job of jobs) {
        // 기존 작업 상태 확인
        let oldStatus: JobStatusType | null = null;
        try {
          const existingJobData = (await this.db.getData(
            `${this.JOB_MAP_PATH}/${job.id}`,
          )) as JobData;
          oldStatus = existingJobData.status as JobStatusType;
        } catch (error) {}

        await this.db.push(
          `${this.JOB_MAP_PATH}/${job.id}`,
          jobToJSON(job),
          false,
        );

        // 상태 인덱스 업데이트
        if (oldStatus) {
          await this.updateStatusIndex(job.id, oldStatus, job.status);
        } else {
          await this.addToStatusIndex(job.id, job.status);
        }
      }
    } catch (error) {
      throw new AppException(ResponseCode.JSON_DB_ERROR);
    }
  }

  async findAll(): Promise<Job[]> {
    try {
      const jobMap = (await this.db.getData(this.JOB_MAP_PATH)) as Record<
        string,
        JobData
      >;
      const jobs = Object.values(jobMap).map((data) => jobFromJSON(data));
      return jobs;
    } catch (error) {
      if (error.message && error.message.includes("Can't find dataPath")) {
        return [];
      }
      throw new AppException(ResponseCode.JSON_DB_ERROR);
    }
  }

  async findAllPaginated(page: number, size: number): Promise<Page<Job>> {
    try {
      // 1. 데이터베이스에서 모든 키를 가져옵니다
      const jobsObj = (await this.db.getData(this.JOB_MAP_PATH)) as Record<
        string,
        JobData
      >;
      const keys = Object.keys(jobsObj);

      // 2. 전체 요소 수와 페이지 계산
      const totalElements = keys.length;
      const totalPages = Math.ceil(totalElements / size);

      // 3. 현재 페이지에 필요한 키만 선택
      const startIndex = page * size;
      const endIndex = Math.min(startIndex + size, totalElements);
      const pageKeys = keys.slice(startIndex, endIndex);

      // 4. 선택된 키에 해당하는 작업 데이터만 가져오기
      const paginatedJobs: Job[] = [];
      for (const key of pageKeys) {
        const jobData = (await this.db.getData(
          `${this.JOB_MAP_PATH}/${key}`,
        )) as JobData;
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
      throw new AppException(ResponseCode.JSON_DB_ERROR);
    }
  }

  async findById(id: string): Promise<Job | null> {
    try {
      const jobData = (await this.db.getData(
        `${this.JOB_MAP_PATH}/${id}`,
      )) as JobData;
      return jobFromJSON(jobData);
    } catch (error) {
      if (error.message && error.message.includes("Can't find dataPath")) {
        return null;
      }
      throw new AppException(ResponseCode.JSON_DB_ERROR);
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

        // 작업 저장
        await this.db.push(
          `${this.JOB_MAP_PATH}/${job.id}`,
          jobToJSON(job),
          false,
        );

        // 상태 인덱스에 추가
        await this.addToStatusIndex(job.id, job.status);

        return job;
      }
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ResponseCode.JSON_DB_ERROR);
    }
  }

  async update(job: Job): Promise<Job> {
    try {
      try {
        // 기존 작업 데이터 가져오기
        const existingJobData = (await this.db.getData(
          `${this.JOB_MAP_PATH}/${job.id}`,
        )) as JobData;
        const oldStatus = existingJobData.status as JobStatusType;

        // 작업 업데이트
        await this.db.push(
          `${this.JOB_MAP_PATH}/${job.id}`,
          jobToJSON(job),
          false,
        );

        // 상태가 변경되었으면 인덱스 업데이트
        if (oldStatus !== job.status) {
          await this.updateStatusIndex(job.id, oldStatus, job.status);
        }

        return job;
      } catch (error) {
        throw new AppException(ResponseCode.JOB_NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ResponseCode.JSON_DB_ERROR);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      try {
        // 기존 작업 데이터 가져오기
        const jobData = (await this.db.getData(
          `${this.JOB_MAP_PATH}/${id}`,
        )) as JobData;
        const status = jobData.status as JobStatusType;

        // 작업 삭제
        await this.db.delete(`${this.JOB_MAP_PATH}/${id}`);

        // 상태 인덱스에서 제거
        await this.removeFromStatusIndex(id, status);

        return true;
      } catch (error) {
        throw new AppException(ResponseCode.JOB_NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ResponseCode.JSON_DB_ERROR);
    }
  }

  async findByTitle(title: string): Promise<Job[]> {
    try {
      const jobs = await this.findAll();
      return jobs.filter((job) =>
        job.title.toLowerCase().includes(title.toLowerCase()),
      );
    } catch (error) {
      throw new AppException(ResponseCode.JSON_DB_ERROR);
    }
  }

  async search(params: {
    status?: JobStatusType;
    title?: string;
  }): Promise<Job[]> {
    try {
      let jobs: Job[] = [];

      // 상태 필터가 있는 경우 인덱스 활용
      if (params.status && !params.title) {
        return await this.findJobsByStatus(params.status);
      }

      // 제목 필터만 있거나 둘 다 있는 경우
      if (params.title && params.title.trim() !== '') {
        // 상태 필터가 있으면 해당 상태의 작업만 가져와서 제목으로 필터링
        if (params.status) {
          const statusJobs = await this.findJobsByStatus(params.status);
          jobs = statusJobs.filter((job) =>
            job.title.toLowerCase().includes(params.title!.toLowerCase()),
          );
        } else {
          // 상태 필터가 없으면 모든 작업을 가져와서 제목으로 필터링
          const allJobs = await this.findAll();
          jobs = allJobs.filter((job) =>
            job.title.toLowerCase().includes(params.title!.toLowerCase()),
          );
        }
        return jobs;
      }

      // 필터가 없으면 모든 작업 반환
      return await this.findAll();
    } catch (error) {
      throw new AppException(ResponseCode.JSON_DB_ERROR);
    }
  }

  async findJobsByStatus(status: JobStatusType): Promise<Job[]> {
    try {
      // 인덱스에서 해당 상태의 작업 ID 가져오기
      const statusIds = await this.getJobIdsByStatus(status);

      // ID에 해당하는 작업 가져오기
      return await this.findJobsByIds(statusIds);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ResponseCode.JSON_DB_ERROR);
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
          const jobData = (await this.db.getData(
            `${this.JOB_MAP_PATH}/${id}`,
          )) as JobData;
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
      throw new AppException(ResponseCode.JSON_DB_ERROR);
    }
  }

  async findJobIdsByStatus(status: JobStatusType): Promise<string[]> {
    try {
      return await this.getJobIdsByStatus(status);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ResponseCode.JSON_DB_ERROR);
    }
  }

  private async getJobIdsByStatus(status: JobStatusType): Promise<string[]> {
    try {
      const indexPath = `${this.STATUS_INDEX_PATH}/${status}`;
      const statusIds = (await this.db.getData(indexPath)) as string[];
      return statusIds || [];
    } catch (error) {
      if (error.message && error.message.includes("Can't find dataPath")) {
        return [];
      }
      throw error;
    }
  }
}
