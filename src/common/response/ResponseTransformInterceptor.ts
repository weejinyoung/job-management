import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from './ResponseDto';
import { CommonHeader, Page } from './Page';
import { ResponseCode } from './ResponseCode';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        let responseData: ResponseDto<any>;
        let httpStatus: HttpStatus = HttpStatus.OK; // 기본값

        if (data === null || data === undefined) {
          responseData = ResponseDto.ok<any>(null);
          // OK 응답의 HTTP 상태 코드 조회
          const details = ResponseCode.getResponseCodeDetails(ResponseCode.OK);
          if (details?.httpStatus) {
            httpStatus = details.httpStatus;
          }
        } else if (data instanceof ResponseDto) {
          responseData = data;

          // ResponseDto에 대응하는 응답 코드의 HTTP 상태 코드 조회
          const details = ResponseCode.getResponseCodeDetails(
            data.responseCode,
          );
          if (details?.httpStatus) {
            httpStatus = details.httpStatus;
          }
        } else if (data instanceof Page) {
          response.header(
            CommonHeader.PAGE_TOTAL_PAGES,
            data.getTotalPages().toString(),
          );
          response.header(
            CommonHeader.PAGE_TOTAL_ELEMENTS,
            data.getTotalElements().toString(),
          );
          responseData = ResponseDto.ok<any>(data.toArray());

          // OK 응답의 HTTP 상태 코드 조회
          const details = ResponseCode.getResponseCodeDetails(ResponseCode.OK);
          if (details?.httpStatus) {
            httpStatus = details.httpStatus;
          }
        } else {
          responseData = ResponseDto.ok<T>(data as T);

          // OK 응답의 HTTP 상태 코드 조회
          const details = ResponseCode.getResponseCodeDetails(ResponseCode.OK);
          if (details?.httpStatus) {
            httpStatus = details.httpStatus;
          }
        }

        // 상태 코드를 HTTP 응답에 설정
        response.status(httpStatus);

        return responseData;
      }),
    );
  }
}
