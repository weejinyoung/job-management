import { HttpStatus } from '@nestjs/common';

export interface ResponseCodeDetails {
  code: string;
  message: string;
  httpStatus?: HttpStatus;
}

export class ResponseCode {
  // 성공 코드 (0000)
  static readonly OK = '0000';

  // 공통 에러 코드 (9000~9999)
  static readonly LOCK_ACQUISITION_FAILED = '9399';
  static readonly BAD_REQUEST = '9400';
  static readonly WRONG_PARAMETER = '9401';
  static readonly METHOD_NOT_ALLOWED = '9402';
  static readonly UNAUTHORIZED = '9403';
  static readonly NOT_FOUND = '9404';
  static readonly REQUEST_TIMEOUT = '9900';
  static readonly JSON_DB_ERROR = '9901';
  static readonly INTERNAL_SERVER_ERROR = '9999';

  // Job 모듈 에러 코드 (2000~2999)
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

  // 응답 코드 세부 정보
  private static readonly RESPONSE_MESSAGES: Record<
    string,
    ResponseCodeDetails
  > = {
    // 성공 코드
    [ResponseCode.OK]: {
      code: ResponseCode.OK,
      message: '정상 처리되었습니다.',
      httpStatus: HttpStatus.OK,
    },

    // 공통 에러 코드
    [ResponseCode.LOCK_ACQUISITION_FAILED]: {
      code: ResponseCode.LOCK_ACQUISITION_FAILED,
      message: '잠시 후 다시 시도해주세요.',
      httpStatus: HttpStatus.CONFLICT,
    },
    [ResponseCode.BAD_REQUEST]: {
      code: ResponseCode.BAD_REQUEST,
      message: '잘못된 요청입니다.',
      httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ResponseCode.WRONG_PARAMETER]: {
      code: ResponseCode.WRONG_PARAMETER,
      message: '잘못된 파라미터입니다.',
      httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ResponseCode.METHOD_NOT_ALLOWED]: {
      code: ResponseCode.METHOD_NOT_ALLOWED,
      message: '허용되지 않은 메서드입니다.',
      httpStatus: HttpStatus.METHOD_NOT_ALLOWED,
    },
    [ResponseCode.UNAUTHORIZED]: {
      code: ResponseCode.UNAUTHORIZED,
      message: '권한이 없습니다.',
      httpStatus: HttpStatus.UNAUTHORIZED,
    },
    [ResponseCode.NOT_FOUND]: {
      code: ResponseCode.NOT_FOUND,
      message: '리소스를 찾을 수 없습니다.',
      httpStatus: HttpStatus.NOT_FOUND,
    },
    [ResponseCode.REQUEST_TIMEOUT]: {
      code: ResponseCode.REQUEST_TIMEOUT,
      message: '일시적인 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.',
      httpStatus: HttpStatus.REQUEST_TIMEOUT,
    },
    [ResponseCode.JSON_DB_ERROR]: {
      code: ResponseCode.JSON_DB_ERROR,
      message: '데이터베이스 에러가 발생하였습니다.',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    },
    [ResponseCode.INTERNAL_SERVER_ERROR]: {
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      message: '내부 서버 에러가 발생하였습니다.',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    },

    // Job 에러 코드
    [ResponseCode.JOB_NOT_FOUND]: {
      code: ResponseCode.JOB_NOT_FOUND,
      message: '존재하지 않는 작업입니다.',
      httpStatus: HttpStatus.NOT_FOUND,
    },
    [ResponseCode.INVALID_JOB_STATUS]: {
      code: ResponseCode.INVALID_JOB_STATUS,
      message: '잘못된 작업 상태입니다.',
      httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ResponseCode.JOB_ALREADY_ASSIGNED]: {
      code: ResponseCode.JOB_ALREADY_ASSIGNED,
      message: '이미 할당된 작업입니다.',
      httpStatus: HttpStatus.CONFLICT,
    },
    [ResponseCode.JOB_EXECUTION_FAILED]: {
      code: ResponseCode.JOB_EXECUTION_FAILED,
      message: '작업 실행에 실패했습니다.',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    },
    [ResponseCode.JOB_DEADLINE_PASSED]: {
      code: ResponseCode.JOB_DEADLINE_PASSED,
      message: '작업 마감일이 지났습니다.',
      httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ResponseCode.JOB_ALREADY_EXISTS]: {
      code: ResponseCode.JOB_ALREADY_EXISTS,
      message: '이미 존재하는 작업입니다.',
      httpStatus: HttpStatus.CONFLICT,
    },
    [ResponseCode.EMPTY_TITLE]: {
      code: ResponseCode.EMPTY_TITLE,
      message: '제목이 비면 안됩니다.',
      httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ResponseCode.EMPTY_DESCRIPTION]: {
      code: ResponseCode.EMPTY_DESCRIPTION,
      message: '설명이 비면 안됩니다.',
      httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ResponseCode.CANNOT_REOPEN_COMPLETED_JOB]: {
      code: ResponseCode.CANNOT_REOPEN_COMPLETED_JOB,
      message: '완료된 작업은 다시 대기 상태로 되돌릴 수 없습니다.',
      httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ResponseCode.CANNOT_CANCEL_COMPLETED_JOB]: {
      code: ResponseCode.CANNOT_CANCEL_COMPLETED_JOB,
      message: '완료된 작업은 취소할 수 없습니다.',
      httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ResponseCode.CANNOT_COMPLETE_CANCELED_JOB]: {
      code: ResponseCode.CANNOT_COMPLETE_CANCELED_JOB,
      message: '취소된 작업은 완료할 수 없습니다.',
      httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ResponseCode.CANNOT_REOPEN_PENDING_JOB]: {
      code: ResponseCode.CANNOT_REOPEN_PENDING_JOB,
      message: '대기 상태의 작업은 다시 열 수 없습니다.',
      httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ResponseCode.ALREADY_COMPLETED_JOB]: {
      code: ResponseCode.ALREADY_COMPLETED_JOB,
      message: '이미 완료된 작업입니다.',
      httpStatus: HttpStatus.CONFLICT,
    },
    [ResponseCode.ALREADY_CANCELED_JOB]: {
      code: ResponseCode.ALREADY_CANCELED_JOB,
      message: '이미 취소된 작업입니다.',
      httpStatus: HttpStatus.CONFLICT,
    },
  };

  static getResponseCodeDetails(code: string): ResponseCodeDetails | undefined {
    return this.RESPONSE_MESSAGES[code];
  }
}
