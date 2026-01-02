import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseUtil } from './api-response.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = (exception as HttpException).getStatus();
      message = (exception as HttpException).message;
    } else if (exception instanceof Error) {
      message = (exception as Error).message;
    }

    response.status(status).json(ApiResponseUtil.error(message));
  }
}