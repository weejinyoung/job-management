import { Job, JobStatusType } from '../entity/Job';

/**
 * Job 엔티티를 JSON 형식으로 변환합니다.
 */
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

/**
 * JSON 데이터를 Job 엔티티로 변환합니다.
 */
export function jobFromJSON(data: any): Job {
  // Job 객체 생성 (최소 필수 필드로)
  const job = new Job(data.title, data.description);

  // ID 할당 (새로 생성하지 않도록)
  job.id = data.id;

  // 상태 설정
  job.status = data.status as JobStatusType;

  // 날짜 필드 변환
  if (data.createdAt) {
    job.createdAt = new Date(data.createdAt);
  }

  if (data.updatedAt) {
    job.updatedAt = new Date(data.updatedAt);
  }

  return job;
}
