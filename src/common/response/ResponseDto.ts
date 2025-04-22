import { BaseResponseCode } from './BaseResponseCode';

export class ResponseDto<T> {
  responseCode: string;
  message: string;
  data?: T;

  private constructor(responseCode: string, message: string, data?: T) {
    this.responseCode = responseCode;
    this.message = message;
    this.data = data;
  }

  static ok<T>(data?: T): ResponseDto<T> {
    const details = BaseResponseCode.getResponseCodeDetails(
      BaseResponseCode.OK,
    );
    return new ResponseDto<T>(
      details?.code || BaseResponseCode.OK,
      details?.message || '정상 처리되었습니다.',
      data,
    );
  }

  static okWithCode<T>(responseCode: string, data?: T): ResponseDto<T> {
    const details = BaseResponseCode.getResponseCodeDetails(responseCode);
    return new ResponseDto<T>(
      details?.code || responseCode,
      details?.message || '정상 처리되었습니다.',
      data,
    );
  }

  static error<T>(responseCode: string): ResponseDto<T> {
    const details = BaseResponseCode.getResponseCodeDetails(responseCode);
    return new ResponseDto<T>(
      details?.code || responseCode,
      details?.message || '오류가 발생했습니다.',
    );
  }

  static errorWithMessage<T>(
    responseCode: string,
    message: string,
  ): ResponseDto<T> {
    return new ResponseDto<T>(responseCode, message);
  }
}
