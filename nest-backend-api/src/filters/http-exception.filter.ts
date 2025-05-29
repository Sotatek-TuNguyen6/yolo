import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Internal server error';
    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      message = exceptionResponse.message as string;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    response.status(status).json({
      success: false,
      error: {
        statusCode: status,
        message,
      },
    });
  }
}
