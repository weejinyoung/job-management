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
  // 날짜를 안전하게 문자열로 변환
  let createdAt = '';
  let updatedAt = '';

  if (job.createdAt) {
    try {
      createdAt =
        job.createdAt instanceof Date
          ? job.createdAt.toISOString()
          : String(job.createdAt);
    } catch (e) {
      createdAt = String(job.createdAt); // 원본 값 유지
    }
  }

  if (job.updatedAt) {
    try {
      updatedAt =
        job.updatedAt instanceof Date
          ? job.updatedAt.toISOString()
          : String(job.updatedAt);
    } catch (e) {
      updatedAt = String(job.updatedAt); // 원본 값 유지
    }
  }

  return {
    id: job.id,
    title: job.title,
    description: job.description,
    status: job.status,
    createdAt,
    updatedAt,
  };
}

export function jobFromJSON(data: any): Job {
  const job = new Job(data.title, data.description);
  job.id = data.id;
  job.status = data.status as JobStatusType;

  if (data.createdAt) {
    try {
      job.createdAt = new Date(data.createdAt);
    } catch (e) {
      // 변환 실패 시 원본 데이터 유지
      job.createdAt = data.createdAt;
      console.warn(
        `Failed to parse createdAt for job ${data.id}: ${e.message}`,
      );
    }
  }

  if (data.updatedAt) {
    try {
      job.updatedAt = new Date(data.updatedAt);
    } catch (e) {
      // 변환 실패 시 원본 데이터 유지
      job.updatedAt = data.updatedAt;
      console.warn(
        `Failed to parse updatedAt for job ${data.id}: ${e.message}`,
      );
    }
  }

  return job;
}
