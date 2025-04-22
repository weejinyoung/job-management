import { Job, JobStatusType } from '../entity/Job';
import { Page } from '../../common/response/Page';

export interface JobRepository {
  /**
   * 모든 작업을 조회합니다.
   */
  findAll(): Promise<Job[]>;

  /**
   * 페이지네이션을 적용하여 작업을 조회합니다.
   */
  findAllPaginated(page: number, size: number): Promise<Page<Job>>;

  /**
   * ID로 작업을 조회합니다.
   */
  findById(id: string): Promise<Job | null>;

  /**
   * 새 작업을 생성합니다.
   */
  create(job: Job): Promise<Job>;

  /**
   * 작업을 업데이트합니다.
   */
  update(job: Job): Promise<Job>;

  /**
   * 작업을 삭제합니다.
   */
  delete(id: string): Promise<boolean>;

  /**
   * 제목으로 작업을 검색합니다.
   */
  findByTitle(title: string): Promise<Job[]>;

  /**
   * 여러 조건으로 작업을 검색합니다.
   */
  search(params: { status?: JobStatusType; title?: string }): Promise<Job[]>;

  /**
   * 특정 상태의 모든 작업을 다른 상태로 업데이트합니다.
   */
  findJobsByStatus(status: JobStatusType): Promise<Job[]>;

  saveAll(jobs: Job[]): Promise<void>;
}
