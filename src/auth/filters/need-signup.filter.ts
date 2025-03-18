import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { NeedSignUpException } from '../exceptions/need-signup.exception';

@Catch(NeedSignUpException)
export class NeedSignUpExceptionFilter implements ExceptionFilter {
  catch(exception: NeedSignUpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.redirect('/users/upload-picture');
  }
}
