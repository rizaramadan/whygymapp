import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Log the error
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Send to Sentry only if it's not a NotFoundException
    if (!(exception instanceof NotFoundException)) {
      if (exception instanceof Error) {
        Sentry.captureException(exception, {
          extra: {
            url: request.url,
            method: request.method,
            body: request.body,
            query: request.query,
            params: request.params,
            headers: request.headers,
          },
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: {
            url: request.url,
            method: request.method,
            body: request.body,
            query: request.query,
            params: request.params,
            headers: request.headers,
          },
        });
      }
    }

    // Check if the request accepts HTML
    const acceptsHtml = request.accepts('html');
    
    if (acceptsHtml) {
      // Render error view for HTML requests
      response.status(status).render('error', {
        message,
        url: request.url,
        stack: process.env.NODE_ENV === 'development' && exception instanceof Error 
          ? exception.stack 
          : undefined,
      });
    } else {
      // Return JSON for API requests
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: exception instanceof Error ? exception.stack : undefined,
        }),
      });
    }
  }
} 