import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Render,
  Res,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpAuthService } from './otp-auth.service';
import { Public } from './decorators/public.decorator';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { User } from 'src/users/users.service';
import { Response } from 'express';
import { ErrorApp } from 'src/common/result';
import { CreateOtpDto, VerifyOtpDto } from './auth.dto';

interface RequestCookieAccessToken {
  cookies: {
    access_token: string;
  };
}

@Controller('auth')
export class AuthController {
  private readonly meApiUrl: string;

  constructor(
    private authService: AuthService,
    private otpAuthService: OtpAuthService,
  ) {
    this.meApiUrl = process.env.ME_API_URL || 'https://whygym.mvp.my.id';
  }

  @Get('/')
  index() {
    return '<script>window.location.href="https://whygym.id"</script>';
  }


  
}
