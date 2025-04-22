import { v4 as uuidv4 } from 'uuid';
import { BaseEntity } from '../../common/entity/BaseEntity';
import { AppException } from 'src/common/exception/BaseException';
import { JobResponseCode } from '../response/JobResponseCode';

export type JobStatusType = 'pending' | 'completed' | 'canceled';

export const JobStatus = {
  PENDING: 'pending' as JobStatusType,
  COMPLETED: 'completed' as JobStatusType,
  CANCELED: 'canceled' as JobStatusType,

  values: () => [JobStatus.PENDING, JobStatus.COMPLETED, JobStatus.CANCELED],

  options: () => [
    { label: 'PENDING', value: JobStatus.PENDING },
    { label: 'COMPLETED', value: JobStatus.COMPLETED },
    { label: 'CANCELED', value: JobStatus.CANCELED },
  ],
} as const;

export class Job extends BaseEntity {
  title: string;
  description: string;
  status: JobStatusType;

  constructor(title: string, description: string) {
    super();
    this.id = uuidv4();
    this.title = title;
    this.description = description;
    this.status = JobStatus.PENDING;
  }

  complete(): void {
    if (this.status === JobStatus.CANCELED) {
      throw new AppException(JobResponseCode.CANNOT_COMPLETE_CANCELED_JOB);
    }
    if (this.status === JobStatus.COMPLETED) {
      throw new AppException(JobResponseCode.ALREADY_COMPLETED_JOB);
    }
    this.status = JobStatus.COMPLETED;
    this.updateTimestamp();
  }

  cancel(): void {
    if (this.status === JobStatus.COMPLETED) {
      throw new AppException(JobResponseCode.CANNOT_CANCEL_COMPLETED_JOB);
    }
    if (this.status === JobStatus.CANCELED) {
      throw new AppException(JobResponseCode.ALREADY_CANCELED_JOB);
    }
    this.status = JobStatus.CANCELED;
    this.updateTimestamp();
  }

  reopen(): void {
    if (this.status === JobStatus.COMPLETED) {
      throw new AppException(JobResponseCode.CANNOT_REOPEN_COMPLETED_JOB);
    }
    if (this.status === JobStatus.PENDING) {
      throw new AppException(JobResponseCode.CANNOT_REOPEN_COMPLETED_JOB);
    }
    this.status = JobStatus.PENDING;
    this.updateTimestamp();
  }

  updateTitle(title: string): void {
    if (!title || title.trim() === '') {
      throw new AppException(JobResponseCode.EMPTY_TITLE);
    }
    this.title = title;
    this.updateTimestamp();
  }

  updateDescription(description: string): void {
    if (!description || description.trim() === '') {
      throw new AppException(JobResponseCode.EMPTY_DESCRIPTION);
    }
    this.description = description;
    this.updateTimestamp();
  }
}
