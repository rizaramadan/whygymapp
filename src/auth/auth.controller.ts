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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpAuthService } from './otp-auth.service';
import { Public } from './decorators/public.decorator';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { User } from 'src/users/users.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpAuthService: OtpAuthService,
  ) {}

  @Public()
  @Get('login')
  @Render('auth/login')
  getLoginPage() {
    return {};
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, string>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('otp/create')
  @Render('auth/otp')
  createOtp(@Body() createOtpDto: { email: string }) {
    return this.otpAuthService.createOtp(createOtpDto.email);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('otp/verify')
  async verifyOtp(
    @Body()
    verifyOtpDto: {
      deviceId: string;
      preAuthSessionId: string;
      userInputCode: string;
    },
    @Res() res: Response,
  ) {
    const jwt = await this.otpAuthService.verifyOtp(
      verifyOtpDto.deviceId,
      verifyOtpDto.preAuthSessionId,
      verifyOtpDto.userInputCode,
    );

    res.cookie('access_token', jwt.access_token);
    return res.redirect('/user-dashboard');
  }

  @Get('profile')
  getProfile(@Request() req: { user: User }) {
    return req.user;
  }

  @Public()
  @Get('find-all')
  findAll() {
    return [];
  }

  @Get('find-all-admin')
  @Roles(Role.Admin)
  findAllAdmin() {
    return [];
  }
}
