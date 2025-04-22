import {
  BaseResponseCode,
  ResponseCodeDetails,
} from 'src/common/response/BaseResponseCode';

export class JobResponseCode extends BaseResponseCode {
  static readonly JOB_NOT_FOUND = '2001';
  static readonly INVALID_JOB_STATUS = '2002';
  static readonly JOB_ALREADY_ASSIGNED = '2003';
  static readonly JOB_EXECUTION_FAILED = '2004';
  static readonly JOB_DEADLINE_PASSED = '2005';
  static readonly JOB_ALREADY_EXISTS = '2006';
  static readonly EMPTY_TITLE = '2007';
  static readonly EMPTY_DESCRIPTION = '2008';
  static readonly CANNOT_REOPEN_COMPLETED_JOB = '2010';
  static readonly CANNOT_CANCEL_COMPLETED_JOB = '2011';
  static readonly CANNOT_COMPLETE_CANCELED_JOB = '2012';
  static readonly INVALID_STATUS_TRANSITION = '2013';
  static readonly CANNOT_REOPEN_PENDING_JOB = '2014';
  static readonly ALREADY_COMPLETED_JOB = '2015';
  static readonly ALREADY_CANCELED_JOB = '2016';

  private static readonly JOB_RESPONSE_MESSAGES: Record<
    string,
    ResponseCodeDetails
  > = {
    [JobResponseCode.JOB_NOT_FOUND]: {
      code: JobResponseCode.JOB_NOT_FOUND,
      message: '존재하지 않는 작업입니다.',
    },
    [JobResponseCode.INVALID_JOB_STATUS]: {
      code: JobResponseCode.INVALID_JOB_STATUS,
      message: '잘못된 작업 상태입니다.',
    },
    [JobResponseCode.JOB_ALREADY_ASSIGNED]: {
      code: JobResponseCode.JOB_ALREADY_ASSIGNED,
      message: '이미 할당된 작업입니다.',
    },
    [JobResponseCode.JOB_EXECUTION_FAILED]: {
      code: JobResponseCode.JOB_EXECUTION_FAILED,
      message: '작업 실행에 실패했습니다.',
    },
    [JobResponseCode.JOB_DEADLINE_PASSED]: {
      code: JobResponseCode.JOB_DEADLINE_PASSED,
      message: '작업 마감일이 지났습니다.',
    },
    [JobResponseCode.JOB_ALREADY_EXISTS]: {
      code: JobResponseCode.JOB_ALREADY_EXISTS,
      message: '이미 존재하는 작업입니다.',
    },
    [JobResponseCode.EMPTY_TITLE]: {
      code: JobResponseCode.EMPTY_TITLE,
      message: '제목이 비면 안됩니다.',
    },
    [JobResponseCode.EMPTY_DESCRIPTION]: {
      code: JobResponseCode.EMPTY_DESCRIPTION,
      message: '설명이 비면 안됩니다.',
    },
    [JobResponseCode.CANNOT_REOPEN_COMPLETED_JOB]: {
      code: JobResponseCode.CANNOT_REOPEN_COMPLETED_JOB,
      message: '완료된 작업은 다시 대기 상태로 되돌릴 수 없습니다.',
    },
    [JobResponseCode.CANNOT_CANCEL_COMPLETED_JOB]: {
      code: JobResponseCode.CANNOT_CANCEL_COMPLETED_JOB,
      message: '완료된 작업은 취소할 수 없습니다.',
    },
    [JobResponseCode.CANNOT_COMPLETE_CANCELED_JOB]: {
      code: JobResponseCode.CANNOT_COMPLETE_CANCELED_JOB,
      message: '취소된 작업은 완료할 수 없습니다.',
    },
    [JobResponseCode.CANNOT_REOPEN_PENDING_JOB]: {
      code: JobResponseCode.CANNOT_REOPEN_PENDING_JOB,
      message: '대기 상태의 작업은 다시 열 수 없습니다.',
    },
    [JobResponseCode.ALREADY_COMPLETED_JOB]: {
      code: JobResponseCode.ALREADY_COMPLETED_JOB,
      message: '이미 완료된 작업입니다.',
    },
    [JobResponseCode.ALREADY_CANCELED_JOB]: {
      code: JobResponseCode.ALREADY_CANCELED_JOB,
      message: '이미 취소된 작업입니다.',
    },
  };

  /**
   * 작업 모듈의 응답 코드 세부정보를 조회합니다.
   */
  protected static override getModuleResponseCodeDetails(
    code: string,
  ): ResponseCodeDetails | undefined {
    return this.JOB_RESPONSE_MESSAGES[code];
  }
}
