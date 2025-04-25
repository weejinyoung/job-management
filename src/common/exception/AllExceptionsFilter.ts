import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseDto } from '../response/ResponseDto';
import { AppException } from './AppException';
import { ResponseCode } from '../response/ResponseCode';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let responseBody: ResponseDto<null>;
    let httpStatus: HttpStatus = HttpStatus.OK; // 기본값 설정

    if (exception instanceof AppException) {
      this.logAppException(exception, request);

      // AppException에서 응답 코드로 세부 정보 조회
      const details = ResponseCode.getResponseCodeDetails(exception.code);

      // HTTP 상태 코드가 있으면 사용, 없으면 기본값 유지
      if (details?.httpStatus) {
        httpStatus = details.httpStatus;
      } else if (exception.httpStatus) {
        httpStatus = exception.httpStatus;
      }

      responseBody = ResponseDto.errorWithMessage(
        exception.code,
        exception.message,
      );

      // HTTP 상태 코드는 응답 헤더에 설정, 응답 본문에는 포함되지 않음
      response.status(httpStatus).json(responseBody);
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message = '잘못된 요청입니다.';

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const exceptionResponseObj = exceptionResponse as Record<string, any>;
        if (exceptionResponseObj.message) {
          if (Array.isArray(exceptionResponseObj.message)) {
            message = exceptionResponseObj.message.join(', ');
          } else {
            message = exceptionResponseObj.message;
          }
        }
      }

      this.logHttpException(exception, request);

      let responseCode: string;
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          responseCode = ResponseCode.BAD_REQUEST;
          break;
        case HttpStatus.UNAUTHORIZED:
          responseCode = ResponseCode.UNAUTHORIZED;
          break;
        case HttpStatus.NOT_FOUND:
          responseCode = ResponseCode.NOT_FOUND;
          break;
        case HttpStatus.METHOD_NOT_ALLOWED:
          responseCode = ResponseCode.METHOD_NOT_ALLOWED;
          break;
        case HttpStatus.REQUEST_TIMEOUT:
          responseCode = ResponseCode.REQUEST_TIMEOUT;
          break;
        default:
          responseCode = ResponseCode.INTERNAL_SERVER_ERROR;
      }

      // 응답 코드에 맞는 HTTP 상태 코드 조회
      const details = ResponseCode.getResponseCodeDetails(responseCode);
      if (details?.httpStatus) {
        httpStatus = details.httpStatus;
      } else {
        // 기본값으로 원래 예외의 상태 코드 사용
        httpStatus = status;
      }

      responseBody = ResponseDto.errorWithMessage(responseCode, message);

      // HTTP 상태 코드는 응답 헤더에 설정, 응답 본문에는 포함되지 않음
      response.status(httpStatus).json(responseBody);
    } else {
      // Handle unknown exceptions
      this.logUnknownException(exception, request);
      responseBody = ResponseDto.error(ResponseCode.INTERNAL_SERVER_ERROR);

      // 내부 서버 오류에 대한 HTTP 상태 코드 조회
      const details = ResponseCode.getResponseCodeDetails(
        ResponseCode.INTERNAL_SERVER_ERROR,
      );
      if (details?.httpStatus) {
        httpStatus = details.httpStatus;
      } else {
        // 기본값 설정
        httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      }

      // HTTP 상태 코드는 응답 헤더에 설정, 응답 본문에는 포함되지 않음
      response.status(httpStatus).json(responseBody);
    }
  }

  private logAppException(exception: AppException, request: Request): void {
    this.logger.error(
      `[AppException] ${request.method} ${request.url} - ${exception.code}: ${exception.message}`,
      exception.stack,
    );
  }

  private logHttpException(exception: HttpException, request: Request): void {
    this.logger.error(
      `[HttpException] ${request.method} ${request.url} - ${exception.getStatus()}: ${exception.message}`,
      exception.stack,
    );
  }

  private logUnknownException(exception: unknown, request: Request): void {
    const errorMessage =
      exception instanceof Error ? exception.message : 'Unknown error';
    const stack =
      exception instanceof Error ? exception.stack : 'No stack trace';

    this.logger.error(
      `[UnknownException] ${request.method} ${request.url} - ${errorMessage}`,
      stack,
    );
  }
}

export class GlobalExceptionFilter {}
