import { v4 as uuidv4 } from 'uuid';
import { BaseEntity } from '../../common/entity/BaseEntity';
import { AppException } from 'src/common/exception/AppException';
import { ResponseCode } from '../../common/response/ResponseCode';

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
    switch (this.status) {
      case JobStatus.CANCELED:
        throw new AppException(ResponseCode.CANNOT_COMPLETE_CANCELED_JOB);
      case JobStatus.COMPLETED:
        throw new AppException(ResponseCode.ALREADY_COMPLETED_JOB);
      case JobStatus.PENDING:
        this.status = JobStatus.COMPLETED;
        this.updateTimestamp();
        break;
    }
  }

  cancel(): void {
    switch (this.status) {
      case JobStatus.COMPLETED:
        throw new AppException(ResponseCode.CANNOT_CANCEL_COMPLETED_JOB);
      case JobStatus.CANCELED:
        throw new AppException(ResponseCode.ALREADY_CANCELED_JOB);
      case JobStatus.PENDING:
        this.status = JobStatus.CANCELED;
        this.updateTimestamp();
        break;
    }
  }

  reopen(): void {
    switch (this.status) {
      case JobStatus.COMPLETED:
        throw new AppException(ResponseCode.CANNOT_REOPEN_COMPLETED_JOB);
      case JobStatus.PENDING:
        throw new AppException(ResponseCode.CANNOT_REOPEN_PENDING_JOB);
      case JobStatus.CANCELED:
        this.status = JobStatus.PENDING;
        this.updateTimestamp();
        break;
    }
  }

  updateDescription(description: string): void {
    if (!description || description.trim() === '') {
      throw new AppException(ResponseCode.EMPTY_DESCRIPTION);
    }
    this.description = description;
    this.updateTimestamp();
  }

  updateTitle(title: string): void {
    if (!title || title.trim() === '') {
      throw new AppException(ResponseCode.EMPTY_TITLE);
    }
    this.title = title;
    this.updateTimestamp();
  }
}
