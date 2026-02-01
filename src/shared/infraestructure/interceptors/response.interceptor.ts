import { Reflector } from '@nestjs/core';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Request, Response } from 'express';
import { BaseResponseDto } from '@/shared/dto/http/base-response.dto';
import { RESPONSE_MESSAGE_KEY } from '@/shared/infraestructure/decorators/response-message.decorator';

export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  BaseResponseDto<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponseDto<T>> {
    return next.handle().pipe(
      map((data: T) => this.responseHandler(data, context)),
      catchError((error: any) => {
        return throwError(() => this.errorHandler(error, context));
      }),
    );
  }

  errorHandler(error: any, context: ExecutionContext): BaseResponseDto<T> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorObj = error as {
      status?: number;
      message?: string;
      response?: T;
    };

    const statusCode = errorObj.status || response.statusCode || 500;
    const traceId = (request.headers['x-trace-id'] as string) || '';
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ||
      errorObj.message ||
      'Operation failed';
    const data = errorObj.response || null;
    const path = request.url;
    const timestamp = new Date();

    return {
      data: data as T,
      success: false,
      message,
      statusCode,
      path,
      timestamp,
      traceId,
    };
  }

  responseHandler(data: T, context: ExecutionContext): BaseResponseDto<T> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = response.statusCode;
    const traceId = (request.headers['x-trace-id'] as string) || '';
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ||
      'Operation successful';
    const path = request.url;
    const timestamp = new Date();

    return {
      data,
      success: true,
      message,
      statusCode,
      path,
      timestamp,
      traceId,
    };
  }
}
