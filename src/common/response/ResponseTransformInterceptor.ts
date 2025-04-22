import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from './ResponseDto';
import { CommonHeader, Page } from './Page';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();

        // If data is null or undefined, return success response with null data
        if (data === null || data === undefined) {
          return ResponseDto.ok<any>(null);
        }

        // If the data is already a ResponseDto, return it as is
        if (data instanceof ResponseDto) {
          return data;
        }

        // Check if the data is a Page object
        if (data instanceof Page) {
          // Add pagination headers
          response.header(
            CommonHeader.PAGE_TOTAL_PAGES,
            data.getTotalPages().toString(),
          );
          response.header(
            CommonHeader.PAGE_TOTAL_ELEMENTS,
            data.getTotalElements().toString(),
          );

          // Return only the array of items from the page
          return ResponseDto.ok<any>(data.toArray());
        }

        // Otherwise, wrap the data in a success ResponseDto
        return ResponseDto.ok<T>(data as T);
      }),
    );
  }
}
