import { Job, JobStatusType } from '../entity/Job';

export function jobToJSON(job: Job): any {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    status: job.status,
    createdAt:
      job.createdAt instanceof Date
        ? job.createdAt.toISOString()
        : job.createdAt,
    updatedAt:
      job.updatedAt instanceof Date
        ? job.updatedAt.toISOString()
        : job.updatedAt,
  };
}

export function jobFromJSON(data: any): Job {
  const job = new Job(data.title, data.description);

  job.id = data.id;

  job.status = data.status as JobStatusType;

  if (data.createdAt) {
    job.createdAt = new Date(data.createdAt);
  }

  if (data.updatedAt) {
    job.updatedAt = new Date(data.updatedAt);
  }

  return job;
}
