import { ResponseCode } from './ResponseCode';

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
    const details = ResponseCode.getResponseCodeDetails(ResponseCode.OK);
    return new ResponseDto<T>(
      details?.code || ResponseCode.OK,
      details?.message || '정상 처리되었습니다.',
      data,
    );
  }

  static okWithCode<T>(responseCode: string, data?: T): ResponseDto<T> {
    const details = ResponseCode.getResponseCodeDetails(responseCode);
    return new ResponseDto<T>(
      details?.code || responseCode,
      details?.message || '정상 처리되었습니다.',
      data,
    );
  }

  static error<T>(responseCode: string): ResponseDto<T> {
    const details = ResponseCode.getResponseCodeDetails(responseCode);
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
