import { ResponseCode } from '../response/ResponseCode';

export class AppException extends Error {
  readonly code: string;
  readonly message: string;
  readonly httpStatus?: number;

  constructor(responseCode: string) {
    // 응답 코드에 맞는 세부 정보 조회
    const details = ResponseCode.getResponseCodeDetails(responseCode);

    // 메시지 설정 (세부 정보가 있으면 해당 메시지, 없으면 기본 메시지)
    const message =
      details?.message || `Unknown error with code: ${responseCode}`;

    super(message);

    this.code = responseCode;
    this.message = message;

    // HTTP 상태 코드가 있으면 설정
    if (details?.httpStatus) {
      this.httpStatus = details.httpStatus;
    }

    // Error 클래스 확장 시 프로토타입 체인 보존을 위한 코드
    Object.setPrototypeOf(this, AppException.prototype);
  }
}
