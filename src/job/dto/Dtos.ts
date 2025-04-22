import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Job, JobStatus, JobStatusType } from '../entity/Job';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({
    description: '작업 제목',
    example: '데이터베이스 마이그레이션',
    required: true,
  })
  @IsNotEmpty({ message: '제목은 필수 입력 항목입니다.' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  title: string;

  @ApiProperty({
    description: '작업 설명',
    example: '기존 MySQL에서 PostgreSQL로 데이터 마이그레이션',
    required: true,
  })
  @IsNotEmpty({ message: '설명은 필수 입력 항목입니다.' })
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  description: string;
}

export class UpdateJobDto {
  @ApiPropertyOptional({
    description: '작업 제목',
    example: '수정된 데이터베이스 마이그레이션',
  })
  @IsOptional()
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  title?: string;

  @ApiPropertyOptional({
    description: '작업 설명',
    example: '수정된 마이그레이션 설명',
  })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  description?: string;
}

export class UpdateJobStatusDto {
  @ApiProperty({
    description: '작업 상태',
    enum: JobStatus.values(),
    enumName: 'JobStatusType',
    example: 'in_progress',
    required: true,
  })
  @IsNotEmpty({ message: '상태는 필수 입력 항목입니다.' })
  @IsEnum(JobStatus.values(), {
    message: '유효한 작업 상태가 아닙니다.',
  })
  status: JobStatusType;
}

export class SearchJobDto {
  @ApiPropertyOptional({
    description: '작업 상태로 필터링',
    enum: JobStatus.values(),
    enumName: 'JobStatusType',
    example: 'pending',
  })
  @IsOptional()
  @IsEnum(JobStatus.values(), {
    message: '유효한 작업 상태가 아닙니다.',
  })
  status?: JobStatusType;

  @ApiPropertyOptional({
    description: '작업 제목으로 검색 (부분 일치)',
    example: '데이터',
  })
  @IsOptional()
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  title?: string;
}

export class UpdateBulkStatusDto {
  @ApiProperty({
    description: '현재 작업 상태',
    enum: JobStatus.values(),
    enumName: 'JobStatusType',
    example: 'pending',
    required: true,
  })
  @IsNotEmpty({ message: '현재 상태는 필수 입력 항목입니다.' })
  @IsEnum(JobStatus.values(), {
    message: '유효한 작업 상태가 아닙니다.',
  })
  fromStatus: JobStatusType;

  @ApiProperty({
    description: '변경할 작업 상태',
    enum: JobStatus.values(),
    enumName: 'JobStatusType',
    example: 'in_progress',
    required: true,
  })
  @IsNotEmpty({ message: '변경할 상태는 필수 입력 항목입니다.' })
  @IsEnum(JobStatus.values(), {
    message: '유효한 작업 상태가 아닙니다.',
  })
  toStatus: JobStatusType;
}

export class JobDto {
  @ApiProperty({
    description: '작업 ID',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  id: string;

  @ApiProperty({
    description: '작업 제목',
    example: '데이터베이스 마이그레이션',
  })
  title: string;

  @ApiProperty({
    description: '작업 설명',
    example: '기존 MySQL에서 PostgreSQL로 데이터 마이그레이션',
  })
  description: string;

  @ApiProperty({
    description: '작업 상태',
    enum: JobStatus.values(),
    enumName: 'JobStatusType',
    example: 'pending',
  })
  status: JobStatusType;

  @ApiProperty({
    description: '작업 생성 시간',
    example: '2023-04-22T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '작업 수정 시간',
    example: '2023-04-22T12:34:56.789Z',
  })
  updatedAt: Date;

  constructor(job: Job) {
    this.id = job.id;
    this.title = job.title;
    this.description = job.description;
    this.status = job.status;
    this.createdAt = job.createdAt;
    this.updatedAt = job.updatedAt;
  }

  static fromEntity(job: Job): JobDto {
    return new JobDto(job);
  }

  static fromEntities(jobs: Job[]): JobDto[] {
    return jobs.map((job) => JobDto.fromEntity(job));
  }
}
