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
import { AppException } from './BaseException';
import { BaseResponseCode } from '../response/BaseResponseCode';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let responseBody: ResponseDto<null>;

    if (exception instanceof AppException) {
      // Handle our custom application exceptions
      this.logAppException(exception, request);
      responseBody = ResponseDto.errorWithMessage(
        exception.responseCode,
        exception.message,
      );

      response.status(HttpStatus.OK).json(responseBody);
    } else if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
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

      // Map HTTP status codes to our ResponseCode
      let responseCode: string;
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          responseCode = BaseResponseCode.BAD_REQUEST;
          break;
        case HttpStatus.UNAUTHORIZED:
          responseCode = BaseResponseCode.UNAUTHORIZED;
          break;
        case HttpStatus.NOT_FOUND:
          responseCode = BaseResponseCode.NOT_FOUND;
          break;
        case HttpStatus.METHOD_NOT_ALLOWED:
          responseCode = BaseResponseCode.METHOD_NOT_ALLOWED;
          break;
        case HttpStatus.REQUEST_TIMEOUT:
          responseCode = BaseResponseCode.REQUEST_TIMEOUT;
          break;
        default:
          responseCode = BaseResponseCode.INTERNAL_SERVER_ERROR;
      }

      responseBody = ResponseDto.errorWithMessage(responseCode, message);

      response.status(HttpStatus.OK).json(responseBody);
    } else {
      // Handle unknown exceptions
      this.logUnknownException(exception, request);
      responseBody = ResponseDto.error(BaseResponseCode.INTERNAL_SERVER_ERROR);
      response.status(HttpStatus.OK).json(responseBody);
    }
  }

  private logAppException(exception: AppException, request: Request): void {
    this.logger.error(
      `[AppException] ${request.method} ${request.url} - ${exception.responseCode}: ${exception.message}`,
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