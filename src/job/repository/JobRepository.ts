import { Job, JobStatusType } from '../entity/Job';
import { Page } from '../../common/response/Page';

export interface JobRepository {

  findAll(): Promise<Job[]>;

  findAllPaginated(page: number, size: number): Promise<Page<Job>>;

  findById(id: string): Promise<Job | null>;

  create(job: Job): Promise<Job>;

  update(job: Job): Promise<Job>;

  delete(id: string): Promise<boolean>;

  findByTitle(title: string): Promise<Job[]>;

  search(params: { status?: JobStatusType; title?: string }): Promise<Job[]>;

  findJobsByStatus(status: JobStatusType): Promise<Job[]>;

  saveAll(jobs: Job[]): Promise<void>;
}
