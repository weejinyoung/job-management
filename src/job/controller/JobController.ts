import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus, Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { JobService } from '../service/JobService';
import { CreateJobDto, JobDto, SearchJobDto, UpdateJobDto } from '../dto/Dtos';
import { Page } from '../../common/response/Page';

@ApiTags('jobs')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '새로운 작업 생성' })
  @ApiBody({ type: CreateJobDto, description: '생성할 작업 정보' })
  @ApiCreatedResponse({
    description: '작업이 성공적으로 생성됨',
    type: JobDto,
  })
  async createJob(@Body() createJobDto: CreateJobDto): Promise<JobDto> {
    return this.jobService.create(createJobDto);
  }

  @Get()
  @ApiOperation({ summary: '작업 목록 조회' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '작업 상태로 필터링',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    description: '작업 제목으로 검색 (부분 일치)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호 (0부터 시작)',
    type: Number,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: '페이지 크기',
    type: Number,
  })
  @ApiQuery({
    name: 'paginate',
    required: false,
    description: '페이지네이션 사용 여부',
    type: Boolean,
  })
  async getJobs(
    @Query() searchJobDto: SearchJobDto,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
    @Query('paginate', new DefaultValuePipe(false)) paginate: boolean,
  ): Promise<JobDto[] | Page<JobDto>> {
    return paginate
      ? this.jobService.findAllPaginated(page, size)
      : this.jobService.search(searchJobDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 작업 조회' })
  @ApiParam({ name: 'id', description: '작업 ID' })
  async getJobById(@Param('id') id: string): Promise<JobDto> {
    return this.jobService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '작업 정보 업데이트' })
  @ApiParam({ name: 'id', description: '작업 ID' })
  @ApiBody({ type: UpdateJobDto })
  async updateJob(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<JobDto> {
    return this.jobService.update(id, updateJobDto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: '작업 완료 처리' })
  @ApiParam({ name: 'id', description: '작업 ID' })
  async completeJob(@Param('id') id: string): Promise<JobDto> {
    return this.jobService.completeJob(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '작업 취소 처리' })
  @ApiParam({ name: 'id', description: '작업 ID' })
  async cancelJob(@Param('id') id: string): Promise<JobDto> {
    return this.jobService.cancelJob(id);
  }

  @Put(':id/reopen')
  @ApiOperation({ summary: '취소된 작업 재개' })
  @ApiParam({ name: 'id', description: '작업 ID' })
  async reopenJob(@Param('id') id: string): Promise<JobDto> {
    return this.jobService.reopenJob(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '작업 삭제' })
  @ApiParam({ name: 'id', description: '작업 ID' })
  @ApiNoContentResponse({ description: '작업이 성공적으로 삭제됨' })
  async deleteJob(@Param('id') id: string): Promise<void> {
    await this.jobService.delete(id);
  }
}
