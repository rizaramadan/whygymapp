import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

interface RequestHeadersUrl {
  headers: {
    accept: string;
  };
  url: string;
}

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestHeadersUrl>();

    // Only redirect for HTML requests (browser requests)
    const acceptHeader = request.headers.accept || '';
    if (acceptHeader.includes('text/html')) {
      //return response.redirect('/auth/login');
      const returnUrl = encodeURIComponent(request.url);
      console.log(returnUrl);
      return response.redirect(`https://whygym.id`);
    }

    // For API requests, return the standard 401 response
    response.status(401).json({
      statusCode: 401,
      message: 'Unauthorized',
      path: request.url,
    });
  }
}
