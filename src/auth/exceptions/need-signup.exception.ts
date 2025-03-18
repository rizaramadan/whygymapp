import { HttpException, HttpStatus } from '@nestjs/common';

export class NeedSignUpException extends HttpException {
  constructor() {
    super('Need to complete signup', HttpStatus.UNAUTHORIZED);
  }
}
