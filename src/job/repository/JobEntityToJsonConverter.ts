import { Job, JobStatusType } from '../entity/Job';

// 반환 타입 명시
interface JobJSON {
  id: string;
  title: string;
  description: string;
  status: JobStatusType;
  createdAt: string;
  updatedAt: string;
}

export function jobToJSON(job: Job): JobJSON {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export function jobFromJSON(data: any): Job {
  const job = new Job(data.title, data.description);
  job.id = data.id;
  job.status = data.status as JobStatusType;

  if (data.createdAt) {
    job.createdAt = data.createdAt;
  }

  if (data.updatedAt) {
    job.updatedAt = data.updatedAt;
  }

  return job;
}
