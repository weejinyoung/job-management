export interface ResponseCodeDetails {
  code: string;
  message: string;
}

export abstract class BaseResponseCode {
  static readonly OK = '0000';

  // 공통 에러 코드 (9000~9999)
  static readonly BAD_REQUEST = '9400';
  static readonly WRONG_PARAMETER = '9401';
  static readonly METHOD_NOT_ALLOWED = '9402';
  static readonly UNAUTHORIZED = '9403';
  static readonly NOT_FOUND = '9404';
  static readonly REQUEST_TIMEOUT = '9900';
  static readonly INTERNAL_SERVER_ERROR = '9999';

  protected static readonly COMMON_RESPONSE_MESSAGES: Record<
    string,
    ResponseCodeDetails
  > = {
    [BaseResponseCode.OK]: {
      code: BaseResponseCode.OK,
      message: '정상 처리되었습니다.',
    },
    [BaseResponseCode.BAD_REQUEST]: {
      code: BaseResponseCode.BAD_REQUEST,
      message: '잘못된 요청입니다.',
    },
    [BaseResponseCode.WRONG_PARAMETER]: {
      code: BaseResponseCode.WRONG_PARAMETER,
      message: '잘못된 파라미터입니다.',
    },
    [BaseResponseCode.METHOD_NOT_ALLOWED]: {
      code: BaseResponseCode.METHOD_NOT_ALLOWED,
      message: '허용되지 않은 메서드입니다.',
    },
    [BaseResponseCode.UNAUTHORIZED]: {
      code: BaseResponseCode.UNAUTHORIZED,
      message: '권한이 없습니다.',
    },
    [BaseResponseCode.NOT_FOUND]: {
      code: BaseResponseCode.NOT_FOUND,
      message: '리소스를 찾을 수 없습니다.',
    },
    [BaseResponseCode.REQUEST_TIMEOUT]: {
      code: BaseResponseCode.REQUEST_TIMEOUT,
      message: '일시적인 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.',
    },
    [BaseResponseCode.INTERNAL_SERVER_ERROR]: {
      code: BaseResponseCode.INTERNAL_SERVER_ERROR,
      message: '내부 서버 에러가 발생하였습니다.',
    },
  };

  /**
   * 응답 코드에 해당하는 세부정보를 조회합니다.
   * 먼저 기본 응답 메시지를 확인한 후, 없으면 모듈별 응답 메시지를 찾습니다.
   */
  static getResponseCodeDetails(code: string): ResponseCodeDetails | undefined {
    // 공통 응답 코드 먼저 확인
    const commonDetails = this.COMMON_RESPONSE_MESSAGES[code];
    if (commonDetails) {
      return commonDetails;
    }

    // 상속받은 클래스에서 모듈별 응답 코드 확인 (이 메서드는 상속받은 클래스에서 오버라이드 필요)
    return this.getModuleResponseCodeDetails(code);
  }

  /**
   * 모듈별 응답 코드 세부정보를 조회합니다.
   * 이 메서드는 각 모듈별 ResponseCode 클래스에서 구현해야 합니다.
   */
  protected static getModuleResponseCodeDetails(
    code: string,
  ): ResponseCodeDetails | undefined {
    return undefined;
  }
}
