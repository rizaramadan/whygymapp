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
import { User } from 'src/users/users.service';
import { Response } from 'express';
import { ErrorApp } from 'src/common/result';
import { CreateOtpDto, VerifyOtpDto } from './auth.dto';
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
  createOtp(@Body() createOtpDto: CreateOtpDto) {
    return this.otpAuthService.createOtp(ErrorApp.success, createOtpDto.email);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('otp/verify')
  async verifyOtp(
    @Body()
    verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwt = await this.otpAuthService.verifyOtp(
      ErrorApp.success,
      verifyOtpDto,
    );
    console.log(jwt);
    if (jwt.error.hasError()) {
      return `<script>openDialog('${jwt.error.message}', '${jwt.error.code}');</script>`;
    } else {
      res.cookie('access_token', jwt.access_token);
      const role = jwt.roles.length > 0 ? jwt.roles[0] : 'user';
      return `<script>window.location.href="/${role}-dashboard"</script>`;
    }
  }

  @Public()
  @Get('login-user-pass')
  @Render('auth/login-user-pass')
  getLoginUserPass() {
    return {};
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login-user-pass')
  async signInUserPass(
    @Body() signInDto: Record<string, string>,
    @Res() res: Response,
  ) {
    const jwt = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );
    res.cookie('access_token', jwt.access_token);
    const role = jwt.roles.length > 0 ? jwt.roles[0] : 'user';
    return res.redirect(`/${role}-dashboard`);
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
  @Roles('admin')
  findAllAdmin() {
    return [];
  }
}
