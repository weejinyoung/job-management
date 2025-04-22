import { BaseResponseCode } from '../response/BaseResponseCode';

export class AppException extends Error {
  readonly responseCode: string;
  readonly message: string;

  constructor(responseCode: string, message?: string) {
    // 메시지가 제공되지 않으면 해당 코드의 기본 메시지를 찾음
    const defaultMessage =
      BaseResponseCode.getResponseCodeDetails(responseCode)?.message;
    const errorMessage =
      message || defaultMessage || '알 수 없는 오류가 발생했습니다.';

    super(errorMessage);
    this.responseCode = responseCode;
    this.message = errorMessage;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppException);
    }

    this.name = 'AppException';
  }
}
